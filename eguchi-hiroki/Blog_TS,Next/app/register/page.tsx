import { registerUser } from '../actions';
import '../../public/register.css'

export default function RegisterPage() {
  return (
    <div className="auth-section">
      <h1>新規登録</h1>

      <form action={registerUser}>
        <div className="form-group">
          <label>ユーザーID:</label>
          <input type="text" name="user_id" />
        </div>
        <div className="form-group">
          <label>パスワード:</label>
          <input type="password" name="password" required minLength={8} />
        </div>
        <button type="submit" className="auth-submit-btn">登録する</button>
      </form>
    </div>
  );
}