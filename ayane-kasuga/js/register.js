document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    if (!registerForm) return;

    // アカウント作成フォームの送信イベントハンドリング
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // フォーム入力値の取得
        const userId = document.getElementById('userId').value;
        const userName = document.getElementById('userName').value;
        const password = document.getElementById('password').value;

        const formData = {
            userId: userId,
            userName: userName,
            password: password
        };

        // 新規ユーザー登録APIへのPOSTリクエスト送信
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            // サーバーからのレスポンス判定
            if (data.success) {
                alert(data.message);
                window.location.href = 'index.html';
            } else {
                alert('エラー: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Registration communication error:', error);
            alert('サーバーとの通信に失敗しました。');
        });
    });
});