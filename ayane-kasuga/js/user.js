// グローバル変数：ログインユーザーIDの保持
let currentUserId = null;

window.addEventListener('DOMContentLoaded', () => {
    const userStatusDiv = document.getElementById('user-status');

    // 無条件でバックエンド（/api/me）に自分の情報を聞きにいく
    fetch('/api/me')
        .then(response => {
            if (!response.ok) {
                // 認証チェック：クッキーがない（未ログイン）なら強制的にログイン画面へ
                alert('ログインが必要です！ログイン画面に移動します。');
                window.location.href = 'login.html';
                throw new Error('未ログイン状態');
            }
            return response.json();
        })
        .then(data => {
            // サーバーから返ってきた本物のユーザーIDをグローバル変数に格納
            currentUserId = data.user.user_id;
            const realUserName = data.user.user_name || 'ゲスト';

            // ヘッダーにログアウトボタンとユーザー名を描画
            if (userStatusDiv) {
                userStatusDiv.innerHTML = `
                    <div class="user-logged-in" style="display: flex; align-items: center; gap: 15px;">
                        <span class="welcome-msg" style="font-weight: 500; color: #333; font-size: 16px;">👤 ${realUserName} さん</span>
                        <button id="logout-btn" onclick="logout()" style="background-color: #FF553C; color: white; padding: 10px 20px; font-size: 14px; cursor: pointer; border: none; font-weight: 300;">Logout</button>
                    </div>
                `;
            }

            // プロフィール情報のマッピング（URLパスを /api/public/... に変更！）
            document.getElementById('profile-user-id').innerText = data.user.user_id;
            document.getElementById('profile-user-name').innerText = data.user.user_name;
            document.getElementById('profile-email').innerText = data.user.email || '未登録';
            
            const avatarName = data.user.profile_image || 'default-icon.png';
            document.getElementById('profile-avatar').src = `/api/public/uploads/${avatarName}`;

            // 過去投稿リストの生成処理
            const container = document.getElementById('my-posts-container');
            container.innerHTML = ''; 

            if (data.articles.length === 0) {
                container.innerHTML = '<p style="color: #666; grid-column: 1/-1;">まだ投稿した記事はありません。</p>';
                return;
            }

            // 記事データのループ処理とHTML生成
            data.articles.forEach(article => {
                const date = new Date(article.updated_at);
                const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                const snippet = article.content.length > 50 ? article.content.substring(0, 50) + '...' : article.content;

                const articleHtml = `
                    <article class="review-card" style="background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: space-between;">
                        <a href="detail.html?id=${article.id}" style="text-decoration: none; color: inherit; display: block;">
                            <div style="margin-bottom: 10px; font-size: 12px; color: #FF553C; font-weight: 600;">Culinary</div>
                            <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px; line-height: 1.4; color: #111;">${article.article_title}</h3>
                            <p style="font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 12px;">${snippet}</p>
                            <time style="font-size: 11px; color: #999;">📅 ${formattedDate}</time>
                        </a>
                        <div class="mypage-edit-btn-wrap">
                            <a href="edit.html?id=${article.id}" class="btn-mypage-edit">✏️ 編集する</a>
                        </div>
                    </article>
                `;
                container.insertAdjacentHTML('beforeend', articleHtml);
            });
        })
        .catch(error => {
            console.error('User data fetch error:', error);
            const container = document.getElementById('my-posts-container');
            if (container) {
                container.innerHTML = '<p style="color: #ef4444;">データの読み込みに失敗しました。</p>';
            }
        });
});

// サーバー連動ログアウト処理
window.logout = () => {
    fetch('/api/logout', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('ログアウトしました');
                window.location.href = 'index.html';
            }
        })
        .catch(error => console.error('Logout error:', error));
};

// ユーザーID更新処理
window.editUserId = () => {
    const newId = prompt('新しいユーザーIDを入力してください：');
    if (!newId || !newId.trim()) return;

    fetch('/api/user/update-id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, newUserId: newId })
    })
    .then(response => {
        if (!response.ok) throw new Error('Update failed');
        return response.json();
    })
    .then(data => {
        alert(data.message);
        window.location.reload();
    })
    .catch(error => {
        console.error('User ID update error:', error);
        alert('ユーザーIDの更新に失敗しました。');
    });
};

// ユーザー名更新処理
window.editUserName = () => {
    const newName = prompt('新しいユーザー名を入力してください：');
    if (!newName || !newName.trim()) return;

    fetch('/api/user/update-name', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, newUserName: newName })
    })
    .then(response => {
        if (!response.ok) throw new Error('Update failed');
        return response.json();
    })
    .then(data => { 
        alert(data.message);
        window.location.reload(); 
    })
    .catch(error => {
        console.error('User name update error:', error);
        alert('ユーザー名の更新に失敗しました。');
    });
};

// メールアドレス更新処理
window.editEmail = () => {
    const newEmail = prompt('新しいメールアドレスを入力してください：');
    if (!newEmail || !newEmail.trim()) return;

    fetch('/api/user/update-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: newEmail })
    })
    .then(response => {
        if (!response.ok) throw new Error('Update failed');
        return response.json();
    })
    .then(data => {
        alert(data.message);
        window.location.reload();
    })
    .catch(error => {
        console.error('Email update error:', error);
        alert('メールアドレスの更新に失敗しました。');
    });
};

// アバター画像アップロード処理
window.uploadAvatar = () => {
    const fileInput = document.getElementById('avatar-input');
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('userId', currentUserId);   
    formData.append('file', file); 

    fetch('/api/user/update-avatar', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error('Upload failed');
        return response.json();
    })
    .then(data => {
        alert(data.message);
        window.location.reload();
    })
    .catch(error => {
        console.error('Avatar upload error:', error);
        alert('画像のアップロードに失敗しました。');
    });
};
