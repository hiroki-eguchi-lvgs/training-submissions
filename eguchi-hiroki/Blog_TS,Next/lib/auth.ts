import { cookies } from 'next/headers';
import { verifyToken } from './jwt';

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    return null;
  }
  const payload = await verifyToken(token);
  return (payload?.userId as string) ?? null;
}

export async function requireLogin(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('ログインが必要です');
  }
  return userId;
}
