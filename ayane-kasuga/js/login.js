document.addEventListener('DOMContentLoaded', () => {
    // ログインフォーム要素の取得（HTML側のID名に基づき取得）
    const loginForm = document.getElementById('loginForm');

    if (!loginForm) return;

    // ログインフォームの送信イベントハンドリング
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // フォーム入力値の取得
        const userId = document.getElementById('userId').value;
        const password = document.getElementById('password').value;

        try {
            // ログインAPIへのPOSTリクエスト送信
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ userId, password })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            // サーバーからのレスポンス判定
            if (data.success) {
                // セッション情報および認証状態の保存
                localStorage.setItem('login_user_id', data.user.userId);
                localStorage.setItem('login_user_name', data.user.userName);
                
                alert(data.message);
                window.location.href = 'index.html';
            } else {
                alert('エラー：' + data.message);
            }

        } catch (error) {
            console.error('Login communication error:', error);
            alert('サーバーエラーが発生しました。サーバーが起動しているか確認してください。');
        }
    });
});