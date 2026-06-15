require('dotenv').config();

const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const path = require('path');
const fs = require('fs');
const fastifyMultipart = require('@fastify/multipart');
const fastifyStatic = require('@fastify/static');

const RECENT_ARTICLES_LIMIT = 6;

const fastify = require('fastify')({ logger: true });
const mysql = require('mysql2/promise');
const { error } = require('console');


// ユーザーIDからユーザー情報を取得する共通関数
async function getUserById(userId) {
    const [rows] = await pool.query(
        'SELECT user_id, user_name, password, email, profile_image FROM users WHERE user_id = ?',
        [userId]
    );
    return rows[0] || null;
}

// プラグインの登録
fastify.register(fastifyMultipart);

fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    prefix: '/public/', 
});

// CORSで許可するオリジンを環境変数から取得（定数化）
// .env から文字列を取得し、カンマ(,)で区切って配列に変換、万が一取れなかった場合のフォールバック（デフォルト値）も設定。
const ALLOWED_ORIGINS = process.env.FRONTEND_ORIGINS 
    ? process.env.FRONTEND_ORIGINS.split(',') 
    : ['http://127.0.0.1:5500', 'http://localhost:5500'];

fastify.register(require('@fastify/cors'), {
    origin: ALLOWED_ORIGINS, // 直書きではなく、上で定義した定数を指定
    credentials: true,                
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']     
});

fastify.register(require('@fastify/cookie'), {
    secret: "my-secret-key",
    hook: 'onRequest'
});

// データベース接続プール設定
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

/**
 * 記事一覧取得 API (最新6件)
 */
fastify.get('/', async (request, reply) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, article_title, content, updated_at, article_image, category FROM articles ORDER BY updated_at DESC LIMIT ?',
            [RECENT_ARTICLES_LIMIT]
        );

        // 本文が30文字を超える場合は切り詰め処理を行う
        const processedData = rows.map(article => {
            let shortContent = article.content;
            if (shortContent && shortContent.length > 30) {
                shortContent = shortContent.substring(0, 30) + '...';
            }
            return {
                id: article.id,
                article_title: article.article_title,
                content: shortContent,
                updated_at: article.updated_at,
                article_image: article.article_image,
                category: article.category
            };
        });

        return processedData;

    } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ success: false, error: '記事一覧の取得に失敗しました', message: '記事一覧の取得に失敗しました' });
    }
});

/**
 * 記事詳細取得 API
 */
fastify.get('/detail', async (request, reply) => {
    try {
        const { id } = request.query;
        if (!id) {
            return reply.status(400).send({ success: false, error: '記事IDが指定されていません', message: '記事IDが指定されていません' });
        }

        const [rows] = await pool.query(
            `SELECT
                a.article_title,
                a.content,
                a.updated_at,
                a.article_image,
                u.user_name,
                u.user_id AS author_id,
                u.profile_image
                FROM articles AS a
                JOIN users AS u ON a.user_id = u.id
                WHERE a.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return reply.status(404).send({ success: false, error: '指定された記事が見つかりませんでした' , message: '指定された記事が見つかりませんでした'});
        }

        return rows[0];

    } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ success: false, error: '記事詳細の取得に失敗しました' , message: '記事詳細の取得に失敗しました' });
    } 
});

/**
 * ユーザー新規登録 API
 */
fastify.post('/register', async (request, reply) => {
    const { userId, userName, password } = request.body;
    if (!userId || !userName || !password) {
        return reply.code(400).send({ success: false, error: 'すべての項目を入力してください', message: 'すべての項目を入力してください' });
    }

    try {
        const existingUser = await getUserById(userId);
        if (existingUser) {
            return reply.code(400).send({ success: false, error: 'このユーザーIDはすでに使用されています。', message: 'このユーザーIDはすでに使用されています。' });
        }

        // パスワードのハッシュ化
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // ハッシュ化した文字列（hashedPassword）を保存
        await pool.query(
            'INSERT INTO users (user_id, user_name, password) VALUES (?, ?, ?)',
            [userId, userName, hashedPassword]
        );

        return { success: true, message: 'ユーザー登録が完了しました！' };

    } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ success: false, error: 'ユーザー登録に失敗しました。', message: 'ユーザー登録に失敗しました。' });
    }
});

/**
 * ユーザーログイン API
 */
fastify.post('/login', async (request, reply) => {
    const { userId, password } = request.body;

    try {
        const user = await getUserById(userId);

        // 入力されたパスワードと、DBにあるハッシュ化されたパスワードを比較
        const isPasswordMatch = user ? await bcrypt.compare(password, user.password) : false;

        if (!user || !isPasswordMatch) {
            return { success: false, error: 'ユーザーIDまたはパスワードが違います。', message: 'ユーザーIDまたはパスワードが違います。' };
        }

        reply.setCookie('session_user', user.user_id, {
            path: '/',
            httpOnly: true, //  JavaScriptからCookieを盗まれないようにするセキュリティ設定
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 1日間有効
        });

        return { 
            success: true, 
            message: 'ログインに成功しました！',
            user: {
                userId: user.user_id,
                userName: user.user_name
            }
        };

    } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ success: false, error: 'ログインに失敗しました。', message: 'ログインに失敗しました。' });
    }
});

/**
 * ユーザープロフィール ＆ 投稿一覧取得 API
 */
fastify.get('/me', async (request, reply) => {
    try {
        const userId = request.cookies.session_user;

        // Cookieを持っていない場合（未ログイン）なら401を返す
        if(!userId) {
            return reply.status(401).send({ success: false, error:'ログインが必要です。', message: 'ログインが必要です。'})
        }

        // プロフィール情報の取得
        const userInfo = await getUserById(userId);

        if (!userInfo) { 
            return reply.status(404).send({ success: false, error: 'ユーザーが見つかりません', message: 'ユーザーが見つかりません' });
        }

        // 該当ユーザーの過去投稿一覧の取得
        const [articleRows] = await pool.query(
            `SELECT a.id, a.article_title, a.content, a.updated_at 
                FROM articles a
                INNER JOIN users u ON a.user_id = u.id
                WHERE u.user_id = ?
                ORDER BY a.updated_at DESC`,
            [userId]
        );

        return {
            user: safeUserInfo,　// 漏洩しないように安全なデータだけを画面に返す
            articles: articleRows
        };

    } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ success: false, error: 'プロフィールデータの取得に失敗しました' , message: 'プロフィールデータの取得に失敗しました'});
    }
});

/**
 * ユーザーID変更 API
 */
fastify.put('/user/update-id', async (request, reply) => {
    try {
        const loginUserId = request.cookies.session_user;
        const { newUserId } = request.body;
        if (!loginUserId) {
            return reply.status(401).send({ success: false, error: 'ログインが必要です。', message: 'ログインが必要です。' });
        }
        if (!newUserId || !newUserId.trim()) {
            return reply.status(400).send({ success: false, error: 'データが不足しています', message: 'データが不足しています' });
        }

        const normalizedNewUserId = newUserId.trim();
        const existingUser = await getUserById(normalizedNewUserId);
        if (existingUser) {
            return reply.status(400).send({ success: false, error: 'このユーザーIDはすでに使用されています。', message: 'このユーザーIDはすでに使用されています。' });
        }
        await pool.query('UPDATE users SET user_id = ? WHERE user_id = ?', [normalizedNewUserId, loginUserId]);
        reply.setCookie('session_user', normalizedNewUserId, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24
        });
        return { success: true, message: 'ユーザーIDを更新しました！' 
        };

    } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ success: false, error: 'ユーザーIDの更新に失敗しました', message: 'ユーザーIDの更新に失敗しました'});
    }
});

/**
 * ユーザー名変更 API
 */
fastify.put('/user/update-name', async (request, reply) => {
    try {
        const { userId, newUserName } = request.body;
        if (!userId || !newUserName) {
            return reply.status(400).send({ success: false, error: 'データが不足しています', message: 'データが不足しています' });
        }

        await pool.query(
            'UPDATE users SET user_name = ? WHERE user_id = ?',
            [newUserName, userId]
        );

        return { success: true, message: 'ユーザー名を更新しました！' };

    } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ success: false, error: 'ユーザー名の更新に失敗しました', message: 'ユーザー名の更新に失敗しました' });
    }
});

/**
 * メールアドレス変更 API
 */
fastify.put('/user/update-email', async (request, reply) => {
    try {
        const { newEmail } = request.body;
        const loginUserId = request.cookies.session_user;

        if (!loginUserId) {
            return reply.status(401).send({ success: false, error: 'ログインが必要です。', message: 'ログインが必要です。' });
        }
        if (!newEmail) {
            return reply.status(400).send({ success: false, error: 'データが不足しています', message: 'データが不足しています' });
        }

        await pool.query(
            'UPDATE users SET email = ? WHERE user_id = ?',
            [newEmail, loginUserId]
        );

        return { success: true, message: 'メールアドレスを更新しました！' };

    } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ success: false, error: 'メールアドレスの更新に失敗しました', message: 'メールアドレスの更新に失敗しました' });
    }
});

/**
 * アバター画像アップロード API
 */
fastify.post('/user/update-avatar', async (request, reply) => {
    try {
        const data = await request.file();
        if (!data) {
            return reply.status(400).send({ success: false, error: 'ファイルがありません', message: 'ファイルがありません'});
        }

        const userId = request.cookies.session_user;
        if (!userId) {
            return reply.status(401).send({ success: false, error: 'ログインが必要です。', message: 'ログインが必要です。' });
        }
        const safeOriginalName = path.basename(data.filename || 'upload');
        const filename = `${Date.now()}_${safeOriginalName}`;
        const uploadPath = path.join(__dirname, 'public', 'uploads', filename);

        // 物理ファイルを指定ディレクトリへストリーム保存
        await new Promise((resolve, reject) => {
            const outStream = fs.createWriteStream(uploadPath);
            data.file.pipe(outStream);
            data.file.on('end', resolve);
            outStream.on('error', reject);
        });

        // データベースのプロフィール画像パスを更新
        await pool.query(
            'UPDATE users SET profile_image = ? WHERE user_id = ?',
            [filename, userId]
        );

        return { success: true, message: 'アイコンを変更しました！', filename: filename };

    } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ success: false, error: '画像のアップロードに失敗しました', message: '画像のアップロードに失敗しました' });
    }
});

/**
 * 記事更新 API
 */
fastify.put('/article/update', async (request, reply) => {
    try {
        const { id, article_title, content } = request.body;

       // 1. 【認証】Cookieからログイン中のユーザーID（文字列）を取得する
        const loginUserId = request.cookies.session_user;
        if (!loginUserId) {
            return reply.status(401).send({ success: false, error: 'ログインが必要です。', message: 'ログインが必要です。' });
        }

        if (!id || !article_title || !content) {
            return reply.status(400).send({ success: false,  error:'必要なデータが不足しています', message: '必要なデータが不足しています' });
        }

        // 2. 【認可】更新対象の記事の「作成者（user_id）」をデータベースから取得する
        const [articles] = await pool.query(
            'SELECT a.id, u.user_id FROM articles a JOIN users u ON a.user_id = u.id WHERE a.id = ?',
            [id]
        );

        if (articles.length === 0) {
            return reply.status(404).send({ success: false, error: '該当する記事が見つかりませんでした。',  message: '該当する記事が見つかりませんでした。' });
        }

        const articleAuthorId = articles[0].user_id; 

        // 3. 【認可】ログインしている人と、記事の作者が「一致するか」をチェックする
        if (loginUserId !== articleAuthorId) {
            // 一致しなければ「権限がありません（403 Forbidden）」と拒否
            return reply.status(403).send({ success: false, error: '他人の記事を編集する権限がありません。',  message: '他人の記事を編集する権限がありません。' });
        }

        // 4. すべてのチェックをクリアしたら、初めてUPDATEを実行する
        await pool.query(
            'UPDATE articles SET article_title = ?, content = ?, updated_at = NOW() WHERE id = ?',
            [article_title, content, id]
        );

        return { success: true, message: '記事を正常に更新しました！' };

    } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ success: false, error: '記事の更新に失敗しました。', message: '記事の更新に失敗しました。' });
    }
});

/**
 * ユーザーログアウト API
 */
fastify.post('/logout', async (request, reply) => {
    reply.setCookie('session_user', '', {
        path: '/',
        httpOnly: true,
        maxAge: 0 
    });

    return { success: true, message: 'ログアウトしました' };
});

// サーバー起動処理
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('サーバーがポート3000(外部受付OK)で起動しました!'); 
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();