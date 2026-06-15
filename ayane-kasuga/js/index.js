document.addEventListener('DOMContentLoaded', () => {
    const userStatusDiv = document.getElementById('user-status');

    //  ① ページが開いた瞬間に、無条件でバックエンド（/api/me）にログイン状態を確認
    fetch('/api/me')
        .then(response => {
            if (!response.ok) throw new Error('未ログインまたはセッション切れ');
            return response.json();
        })
        .then(data => {
            // 【ログイン状態のとき】バックエンドから返ってきた本物のユーザー情報を反映
            const userId = data.user.user_id;
            const realUserName = data.user.user_name || 'ゲスト';

            if (userStatusDiv) {
                userStatusDiv.innerHTML = `
                <div class="user-logged-in" style="display: flex; align-items: center; gap: 15px;">
                    <a href="user.html?userId=${encodeURIComponent(userId)}" class="welcome-msg" style="font-weight: 500; color: #333; font-size: 16px; text-decoration: none; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#FF553C'" onmouseout="this.style.color='#333'">
                        👤 ${realUserName} さん
                    </a>
                    <button id="logout-btn" onclick="logout()" style="background-color: #FF553C; color: white; padding: 10px 20px; font-size: 14px; cursor: pointer; border: none; font-weight: 300;">Logout</button>
                </div>
                `;
            }
        })
        .catch(error => {
            // 【未ログイン状態のとき（401エラーなどが飛んできたとき）】通常のログイン・登録ボタンを表示
            if (userStatusDiv) {
                userStatusDiv.innerHTML = `
                    <a href="login.html" style="text-decoration: none; color: #333; font-size: 14px;">Login</a>
                    <a href="register.html" class="btn-primary" style="text-decoration: none; background-color: #FF553C; color: white; padding: 10px 20px; font-size: 14px; margin-left: 15px;">Get started</a>
                `;
            }
        });

    //  ② 記事一覧データの取得と反映
    fetch('/api/')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch articles');
            return response.json(); 
        })
        .then(articles => {
            const reviewGrid = document.querySelector('.review-grid');
            if (!reviewGrid) return;
            
            reviewGrid.innerHTML = '';

            articles.forEach((article) => {
                let currentImage = '';
                
                if (article.article_image && article.article_image !== '' && article.article_image !== 'null') {
                    currentImage = `/api/public/uploads/${article.article_image}`;
                } else {
                    currentImage = 'https://placehold.co/600x400?text=No+Image';
                }
                
                const articleHtml = `
                <a href="detail.html?id=${article.id}" class="card-link" style="text-decoration: none; color: inherit; display: block;">    
                    <article class="card-review">
                        <figure class="post-img">
                            <img src="${currentImage}" alt="post_img" style="width: 100%; height: auto; object-fit: cover;">
                        </figure>
                        <div class="post-content">
                            <div class="post-meta">
                                <span class="post-category">${article.category || 'Travel'}</span>
                                <time class="post-date">${formatDate(article.updated_at)}</time>
                            </div>
                            <h3 class="review-title">${article.article_title}</h3>
                            <p class="review-text">${article.content}</p>
                        </div>
                    </article>
                </a>
                `;

                reviewGrid.insertAdjacentHTML('beforeend', articleHtml);
            });
        })
        .catch(error => console.error('Articles fetch error:', error));
});

// 日付フォーマット変換関数 (YYYY-MM-DD)
function formatDate(dateString) {
    if (!dateString) return '不明な日付';
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
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