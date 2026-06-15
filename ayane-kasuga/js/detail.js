window.addEventListener('DOMContentLoaded', () => {
    const navbarNav = document.querySelector('.header .navbar');
    let currentUserId = null; 

    //  ① まずはバックエンドに「ログインしてるのか確認
    fetch('/api/me')
        .then(res => {
            if (!res.ok) throw new Error('未ログイン状態です');
            return res.json();
        })
        .then(data => {
            // 【ログイン状態のとき】
            currentUserId = data.user.user_id;
            
            if (navbarNav) {
                navbarNav.innerHTML = `
                    <div class="user-logged-in" style="display: flex; align-items: center; gap: 15px;">
                        <a href="user.html?userId=${currentUserId}" id="header-user-link" style="text-decoration: none; font-weight: 500; color: #333; font-size: 16px; transition: color 0.2s;">
                            👤 ${data.user.user_name} さん
                        </a>
                        <button id="logout-btn" onclick="logout()" style="background-color: #FF553C; color: white; padding: 10px 20px; font-size: 14px; cursor: pointer; border: none; font-weight: 300;">Logout</button>
                    </div>
                `;
            }
        })
        .catch(err => {
            // 【未ログイン状態のとき（401エラーなどが飛んできたとき）】
            currentUserId = null;
            if (navbarNav) {
                navbarNav.innerHTML = `
                    <ul class="navbar-list">
                        <li><a href="login.html">Login</a></li>
                        <li><a href="register.html" class="btn-primary">Get started</a></li>
                    </ul>
                `;
            }
        })
        .finally(() => {
            // ② ログインチェックが「成功しても失敗しても」、最後に記事詳細の読み込みに進む
            // これにより、currentUserId が確定した状態で安全に編集ボタンの本人判定ができる
            loadArticleDetails(currentUserId);
        });
});

// 記事詳細を取得して画面に反映する
function loadArticleDetails(currentUserId) {
    const urlParams = new URLSearchParams(window.location.search);
    let articleId = urlParams.get('id') || '7';

    fetch(`/api/detail?id=${articleId}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch article details');
            return response.json();
        })
        .then(article => {
            // タイトル・作成者名の反映
            document.querySelector('.article-title-wrapper .article-title').innerText = article.article_title;
            document.querySelector('.author-profile-detail .profile-name').innerText = article.user_name;
            
            // アイコン画像の反映
            const avatarName = article.profile_image || 'default-icon.png';
            const avatarImg = document.getElementById('detail-avatar') || document.querySelector('.profile-img img');
            if (avatarImg) {
                avatarImg.src = `/api/public/uploads/${avatarName}`;
            }

            // 記事メイン画像と本文の反映
            const articleContentDiv = document.querySelector('.article-content');
            if (articleContentDiv) {
                articleContentDiv.innerHTML = '';

            if (article.article_image) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'article-main-img-wrapper';
                    wrapper.style.marginBottom = '20px';
                    wrapper.innerHTML = `
                        <figure class="article-main-img">
                            <img src="/api/public/uploads/${article.article_image}" alt="article-img">
                        </figure>
                        <p class="article-main-img-description" style="margin-top: 8px;">Featured Image</p>
                    `;
                    articleContentDiv.appendChild(wrapper);
                }
                const p = document.createElement('p');
                p.className = 'article-text';
                p.style.whiteSpace = 'pre-wrap';
                p.style.marginBottom = '30px';
                p.textContent = article.content ?? '';
                articleContentDiv.appendChild(p);
            }
            
            // 投稿日時の反映
            const date = new Date(article.updated_at);
            const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); 
            document.querySelector('.author-profile-detail time').innerText = formattedDate;

            // 作成者本人である場合のみ編集ボタンを表示
            const articleAuthorId = article.author_id;

            // 💡 編集ボタンを出す処理の直前に、このログを仕込む！
            console.log("【認可チェック】ログイン中:", currentUserId, " 記事の作者:", articleAuthorId);

            if (currentUserId && currentUserId === articleAuthorId) {
                const editBtnContainer = document.getElementById('edit-button-container');
                if (editBtnContainer) editBtnContainer.style.display = 'block'; 

                const editBtn = document.getElementById('btn-edit-goto');
                if (editBtn) editBtn.href = `edit.html?id=${articleId}`; 
            }
        })
        .catch(error => console.error('Article fetch error:', error));
}

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