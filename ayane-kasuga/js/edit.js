document.addEventListener('DOMContentLoaded', async () => {
    // 1. URLパラメータから編集対象の記事IDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (!articleId) {
        alert('記事の番号が確認できませんでした。トップページに戻ります。');
        window.location.href = 'index.html';
        return;
    }

    // DOM要素の取得
    const titleInput = document.getElementById('article-title');
    const contentInput = document.getElementById('article-content');
    const editForm = document.getElementById('edit-form');
    const navbarNav = document.querySelector('.header .navbar');

    let currentUserId = null;

    try {
        // まずはバックエンドにログイン情報を確認
        const authResponse = await fetch('/api/me');
        if (!authResponse.ok) {
            alert('🔒 編集するにはログインが必要です。');
            window.location.href = 'login.html';
            return;
        }
        
        const authData = await authResponse.json();
        currentUserId = authData.user.user_id;
        const realUserName = authData.user.user_name || 'ゲスト';

        // ヘッダーUIの書き換え
        if (navbarNav) {
            navbarNav.innerHTML = `
                <div class="user-logged-in" style="display: flex; align-items: center; gap: 15px;">
                    <a href="user.html?userId=${encodeURIComponent(currentUserId)}" id="header-user-link" style="text-decoration: none; font-weight: 500; color: #333; font-size: 16px; transition: color 0.2s;">
                        👤 ${realUserName} さん
                    </a>
                    <button id="logout-btn" onclick="logout()" style="background-color: #FF553C; color: white; padding: 10px 20px; font-size: 14px; cursor: pointer; border: none; font-weight: 300;">Logout</button>
                </div>
            `;
        }

        // ログインしていることが確定したら、記事の既存データを取得する
        const detailResponse = await fetch(`/api/detail?id=${articleId}`);
        if (!detailResponse.ok) throw new Error('Failed to fetch article data');
        
        const article = await detailResponse.json();
        const articleAuthor = article.author_id;

        // 本物の「ログインユーザーID」と「記事の作者ID」を比較する
        if (currentUserId !== articleAuthor) {
            alert('🔒 この記事の編集権限がありません。');
            window.location.href = 'index.html'; 
            return; 
        }

        // フォーム入力欄への初期値マッピング
        titleInput.value = article.article_title;
        contentInput.value = article.content; 

    } catch (error) {
        console.error('Data load error:', error);
        alert('記事のデータを読み込めませんでした。トップページに戻ります。');
        window.location.href = 'index.html';
        return;
    }

    // 変更保存フォームのイベントハンドリング
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const updatedData = {
            id: articleId,
            article_title: titleInput.value,
            content: contentInput.value
        };

        // 記事更新APIへのPUTリクエスト送信
        fetch('/api/article/update', {
            method: 'PUT',
            headers: { 'Content-Type' : 'application/json' },
            body: JSON.stringify(updatedData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Update failed');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('✨記事の修正が完了しました！');
                window.location.href = 'index.html';
            } else {
                alert('エラー：' + data.message);
            }
        })
        .catch(error => console.error('Submit error:', error));
    });
});

// ログアウト処理
window.logout = () => {
    // バックエンドのログアウトAPIを呼び出す
    fetch('/api/logout', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('ログアウトしました');
                window.location.href = 'index.html'; // トップページに戻る
            }
        })
        .catch(error => console.error('Logout error:', error));
};