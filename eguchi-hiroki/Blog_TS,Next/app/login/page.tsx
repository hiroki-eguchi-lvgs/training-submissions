import { loginUser } from '../actions';
import '../../public/register.css';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
        <button type="submit" className="auth-submit-btn">ログイン</button>
      </form>
    </div>
  );
}