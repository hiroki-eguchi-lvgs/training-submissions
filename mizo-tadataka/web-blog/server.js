//環境の構築
//ライブラリ導入と設定、ツールの導入
require("dotenv").config();
const fastify = require("fastify")({ logger: true });
const fastifyMysql = require("@fastify/mysql");
const fastifyStatic = require("@fastify/static");
const path = require("path");
const argon2 = require("argon2");
const fastifyformBody = require("@fastify/formbody");
const fastifycookie = require("@fastify/cookie");
const fs = require("fs");
const fastifymultipart = require("@fastify/multipart");
const { pipeline } = require("stream/promises");
const crypto = require("crypto");

//プラグイン（拡張パーツ）の設定
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
});
fastify.register(fastifyMysql, {
  promise: true,
  connectionString: process.env.DB_URL,
});
fastify.register(fastifyformBody);
fastify.register(fastifycookie, {
  secret: process.env.COOKIE_SECRET,
});
fastify.register(fastifymultipart);

//プログラム開始
//ヘルスチェックのエンドポイント
fastify.get("/api/v1/healthcheck", async (request, reply) => {
  return {
    message: "サーバーは正常に稼働しています。",
    timestamp: new Date().toISOString(),
  };
});
//データの送信(新規登録)
fastify.post("/api/v1/register", async (request, reply) => {
  try {
    const { user_id, username, email, password } = request.body;
    //バリデーションチェック
    if (!user_id || !username || !email || !password) {
      return reply
        .code(400)
        .send({ message: "すべての項目を入力してください。" });
    }
    const hashedPassword = await argon2.hash(password);
    await fastify.mysql.query(
      "INSERT INTO users (user_id, username, email, password) VALUES (?, ?, ?, ?)",
      [user_id, username, email, hashedPassword],
    );

    return reply.send({ message: "ユーザー登録完了！" });
  } catch (err) {
    fastify.log.error(err);
    if (err.code == "ER_DUP_ENTRY") {
      return reply
        .code(400)
        .send({ message: "すでにID、メールアドレスが使われています。" });
    }
    return reply.code(500).send({ message: "エラーです" });
  }
});
//データの照合および認証(ログイン)
fastify.post("/api/v1/login", async (request, reply) => {
  try {
    const { identifier, password } = request.body;

    // 💡 バリデーション追加
    if (!identifier || !password) {
      return reply
        .code(400)
        .send({ message: "すべての項目を入力してください。" });
    }
    //Dataを取ってくる
    const [users] = await fastify.mysql.query(
      "SELECT * FROM users WHERE email = ? OR user_id = ?",
      [identifier, identifier],
    );
    //検索結果が引っかからなかったとき
    if (users.length === 0) {
      return reply
        .code(401)
        .send({ message: "ユーザーが見つかりませんでした。" });
    }

    const user = users[0];

    //パスワード検証
    const isMatch = await argon2.verify(user.password, password);

    if (!isMatch) {
      return reply.code(401).send({
        message: "ユーザーID、メールアドレスもしくはパスワードが異なります。",
      });
    }

    //クッキーの紐づけと設定、および発行
    reply.setCookie("userid", String(user.id), {
      path: "/",
      signed: true,
      httpOnly: true,
      // 本番環境だとtureにすることで、HTTPS通信のときのみクッキーが送信されるようになる
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    return {
      success: true, //成功フラグ
      message: "ログイン成功",
      username: user.username,
    };
  } catch (err) {
    fastify.log.error(err);
    return reply.code(500).send({ message: "サーバーエラー" });
  }
});

//一覧表示（全ての記事の中から、投稿日が新しい順に６つの記事を表示する）
fastify.get("/api/v1/list", async (request, reply) => {
  try {
    const [articles] = await fastify.mysql.query(
      `SELECT 
        a.id AS article_id,
        a.title As article_title, 
        LEFT(a.content,50) AS summary,
        a.created_at,
        ai.file_name
      FROM articles a 
      LEFT JOIN article_images ai
      ON a.id = ai.article_id AND ai.is_main = 1
      ORDER BY a.created_at DESC
      LIMIT ?`,
      [parseInt(process.env.ARTICLE_COUNT) || 6],
    );
    return {
      success: true, //成功フラグ
      articles: articles,
    };
  } catch (err) {
    fastify.log.error(err);
    return reply.code(500).send({ message: "サーバーエラー" });
  }
});
//記事の詳細表示（記事の内容と、記事に紐づく画像を全て表示する）
fastify.get("/api/v1/detail/:id", async (request, reply) => {
  try {
    const articleID = request.params.id;
    if (isNaN(articleID)) {
      return reply.code(400).send({ message: "無効な記事IDです。" });
    }
    const [articles] = await fastify.mysql.query(
      `SELECT 
        a.id AS article_id,
        a.title AS article_title,
        a.content,
        a.created_at,
        ai.file_name,
        ai.is_main
      FROM articles a 
      LEFT JOIN article_images ai
      ON a.id = ai.article_id
      WHERE a.id = ?`,
      [articleID],
    );
    if (articles.length === 0) {
      return reply.code(404).send({ message: "記事が見つかりませんでした。" });
    }
    const article = articles[0];
    const images = articles
      .filter((row) => row.file_name)
      .map((row) => ({ file_name: row.file_name, is_main: row.is_main }));
    return {
      success: true, //成功フラグ
      article: {
        id: article.article_id,
        title: article.article_title,
        content: article.content,
        createdAt: article.created_at,
        images: images,
      },
    };
  } catch (err) {
    fastify.log.error(err);
    return reply.code(500).send({ message: "サーバーエラー" });
  }
});
//ユーザープロフィールの表示（ユーザーID、ユーザー名を表示する）
fastify.get("/api/v1/profile", async (request, reply) => {
  try {
    const rawuserID = request.cookies.userid;
    if (!rawuserID) {
      return reply.code(401).send({
        message:
          "セッションの有効期限が切れました。お手数ですが、再度ログインしてください。",
      });
    }

    const cookie = request.unsignCookie(rawuserID);
    if (!cookie.valid) {
      return reply.code(401).send({
        message:
          "認証情報の確認に失敗しました。安全のため、もう一度ログインし直してください。",
      });
    }
    const userID = cookie.value;
    const [users] = await fastify.mysql.query(
      "SELECT id, user_id, username FROM users WHERE id = ?",
      [userID],
    );
    if (users.length === 0) {
      return reply
        .code(404)
        .send({ message: "ユーザーが見つかりませんでした。" });
    }
    const user = users[0];
    return {
      success: true,
      user: {
        id: user.id,
        userId: user.user_id,
        username: user.username,
      },
    };
  } catch (err) {
    fastify.log.error(err);
    return reply.code(500).send({ message: "サーバーエラー" });
  }
});
//プロフィールの編集（ユーザー名、IDを変更できるようにする）
fastify.post("/api/v1/editUser", async (request, reply) => {
  try {
    const rawuserID = request.cookies.userid;
    if (!rawuserID) {
      return reply.code(401).send({
        message:
          "セッションの有効期限が切れました。お手数ですが、再度ログインしてください。",
      });
    }

    const cookie = request.unsignCookie(rawuserID);
    if (!cookie.valid) {
      return reply.code(401).send({
        message:
          "認証情報の確認に失敗しました。安全のため、もう一度ログインし直してください。",
      });
    }
    const userID = cookie.value;
    const { user_id, username } = request.body;
    if (!user_id || !username) {
      return reply
        .code(400)
        .send({ message: "すべての項目を入力してください。" });
    }

    await fastify.mysql.query(
      "UPDATE users SET user_id = ?, username = ? WHERE id = ?",
      [user_id, username, userID],
    );

    return {
      success: true,
      message: "プロフィールが更新されました。",
    };
  } catch (err) {
    fastify.log.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      //不正なリクエスト
      return reply
        .code(400)
        .send({ message: "すでにユーザーIDは使われています。" });
    }
    return reply.code(500).send({ message: "サーバーエラー" });
  }
});
//自分の記事一覧表示（自分が投稿した記事を投稿日が新しい順に表示する）
fastify.get("/api/v1/mylist", async (request, reply) => {
  try {
    const rawuserID = request.cookies.userid;
    if (!rawuserID) {
      return reply.code(401).send({
        message:
          "セッションの有効期限が切れました。お手数ですが、再度ログインしてください。",
      });
    }

    const cookie = request.unsignCookie(rawuserID);
    if (!cookie.valid) {
      return reply.code(401).send({
        message:
          "認証情報の確認に失敗しました。安全のため、もう一度ログインし直してください。",
      });
    }
    const userID = cookie.value;

    const [articles] = await fastify.mysql.query(
      `SELECT 
        a.id AS article_id,
        a.title AS article_title,
        LEFT(a.content,50) AS summary,
        a.created_at,
        ai.file_name
      FROM articles a 
      LEFT JOIN article_images ai
      ON a.id = ai.article_id AND ai.is_main = 1
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC`,
      [userID],
    );
    // 💡 【追加②】DBから本当に記事が取れたのか確認
    console.log("★DBから取得できた記事データの中身:", articles);
    return {
      success: true, //成功フラグ
      articles: articles,
    };
  } catch (err) {
    fastify.log.error(err);
    return reply.code(500).send({ message: "サーバーエラー" });
  }
});
//editarticle（記事の編集）
fastify.post("/api/v1/editBlog/:blogid", async (request, reply) => {
  try {
    const articleID = request.params.blogid;
    if (isNaN(articleID)) {
      return reply.code(400).send({ message: "無効な記事IDです。" });
    }
    const rawuserID = request.cookies.userid;
    if (!rawuserID) {
      return reply.code(401).send({
        message:
          "セッションの有効期限が切れました。お手数ですが、再度ログインしてください。",
      });
    }

    const cookie = request.unsignCookie(rawuserID);
    if (!cookie.valid) {
      return reply.code(401).send({
        message:
          "認証情報の確認に失敗しました。安全のため、もう一度ログインし直してください。",
      });
    }
    const userID = cookie.value;
    const { blog_title, blog_content } = request.body;
    if (!blog_title || !blog_content) {
      return reply
        .code(400)
        .send({ message: "すべての項目を入力してください。" });
    }
    await fastify.mysql.query(
      "UPDATE articles SET title = ?, content = ? WHERE id = ? AND user_id = ?",
      [blog_title, blog_content, articleID, userID],
    );

    return {
      success: true,
      message: "記事が更新されました。",
    };
  } catch (err) {
    fastify.log.error(err);
    return reply.code(500).send({ message: "サーバーエラー" });
  }
});
//サーバーの起動
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port: port });
    console.log(`サーバーが ${port} 番にて開始`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
