import { cookies } from 'next/headers';
import { logoutUser } from './actions';

export default async function Header() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  return (
    <header>
      <div className="header-inner">
        <div className="title">
          <a href="/">DAYDAYTRAVEL</a>
        </div>
        <nav>
          <ul>
            {userId ? (
              <>
                <li><a href='/user'>ようこそ、{userId}さん</a></li>
                <li><a href='/create' className="btn-primary">投稿する</a></li>
                <li>
                  <form action={logoutUser}>
                    <button type="submit" className="btn-text">Logout</button>
                  </form>
                </li>
              </>
            ) : (
              <>
                <li><a href="/login" className="btn-text">Login</a></li>
                <li><a href="/register" className="btn-primary">Get Started</a></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}