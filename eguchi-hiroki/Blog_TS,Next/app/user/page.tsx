import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import db from '../../db';
import '../../public/register.css';

export default async function UserPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    redirect('/login');
  }

  const users = await new Promise<any[]>((resolve, reject) => {
    db.query('SELECT * FROM users WHERE user_id = ?', [userId], (err: any, results: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });

  const user = users[0];

  return (
    <div className="auth-section">
      <h1>プロフィール</h1>
      <p>ユーザーID: {user.user_id}</p>
      <p>メールアドレス: {user.email ?? '未設定'}</p>
      <p>SNSリンク: {user.sns_link ?? '未設定'}</p>
      <a href="/user/edit" className="auth-submit-btn">編集する</a>
    </div>
  );
}