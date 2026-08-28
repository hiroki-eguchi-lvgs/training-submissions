import { loginUser } from '../actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '../../lib/jwt';
import '../../public/register.css';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = token ? await verifyToken(token) : null;
  if (payload) {
    redirect('/');
  }

  return (
    <div className="auth-section">
      <h1>ログイン</h1>

      {error === 'notfound' && <p>ユーザーが見つかりません</p>}
      {error === 'wrongpassword' && <p>パスワードが違います</p>}

      <form action={loginUser}>
        <div className="form-group">
          <label>ユーザーID:</label>
          <input type="text" name="user_id" />
        </div>
        <div className="form-group">
          <label>パスワード:</label>
          <input type="password" name="password" required />
        </div>
        <button type="submit" className="auth-submit-btn">
          ログイン
        </button>
      </form>
    </div>
  );
}
