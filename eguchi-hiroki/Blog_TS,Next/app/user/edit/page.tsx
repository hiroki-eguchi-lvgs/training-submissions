import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import db from '../../../db';
import { QueryError, RowDataPacket } from 'mysql2';
import { User } from '../../../types';
import { updateProfile } from '../../actions';
import '../../../public/register.css';

export default async function EditUserPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

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
      <h1>プロフィール編集</h1>

      <form action={updateProfile}>
        <input type="hidden" name="user_id" value={user.user_id} />
        <div className="form-group">
          <label>メールアドレス:</label>
          <input type="email" name="email" defaultValue={user.email ?? ''} />
        </div>
        <div className="form-group">
          <label>SNSリンク:</label>
          <input
            type="text"
            name="sns_link"
            defaultValue={user.sns_link ?? ''}
          />
        </div>
        <button type="submit" className="auth-submit-btn">
          更新する
        </button>
      </form>
    </div>
  );
}
