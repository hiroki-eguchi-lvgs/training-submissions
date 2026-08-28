import { cookies } from 'next/headers';
import { verifyToken } from '../../lib/jwt';
import { redirect } from 'next/navigation';
import db from '../../db';
import { QueryError, RowDataPacket } from 'mysql2';
import { User } from '../../types';
import '../../public/register.css';

export default async function UserPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = token ? await verifyToken(token) : null;
  const userId = payload?.userId as string | undefined;

  if (!userId) {
    redirect('/login');
  }

  const users = await new Promise<User[]>((resolve, reject) => {
    db.query<(User & RowDataPacket)[]>(
      'SELECT * FROM users WHERE user_id = ?',
      [userId],
      (err: QueryError | null, results: User[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      },
    );
  });

  const user = users[0];

  return (
    <div className="auth-section">
      <h1>プロフィール</h1>
      <p>ユーザーID: {user.user_id}</p>
      <p>メールアドレス: {user.email ?? '未設定'}</p>
      <p>SNSリンク: {user.sns_link ?? '未設定'}</p>
      <a href="/user/edit" className="auth-submit-btn">
        編集する
      </a>
    </div>
  );
}
