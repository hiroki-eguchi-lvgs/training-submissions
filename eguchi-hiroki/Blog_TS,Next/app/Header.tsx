import Link from 'next/link';
import { cookies } from 'next/headers';
import { logoutUser } from './actions';
import { verifyToken } from '../lib/jwt';

export default async function Header() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload = token ? await verifyToken(token) : null;
  const userId = payload?.userId as string | undefined;

  return (
    <header>
      <div className="header-inner">
        <div className="title">
          <Link href="/">DAYDAYTRAVEL</Link>
        </div>
        <nav>
          <ul>
            {userId ? (
              <>
                <li>
                  <a href="/user">ようこそ、{userId}さん</a>
                </li>
                <li>
                  <a href="/create" className="btn-primary">
                    投稿する
                  </a>
                </li>
                <li>
                  <form action={logoutUser}>
                    <button type="submit" className="btn-text">
                      Logout
                    </button>
                  </form>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a href="/login" className="btn-text">
                    Login
                  </a>
                </li>
                <li>
                  <a href="/register" className="btn-primary">
                    Get Started
                  </a>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
