import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload;
  } catch {
    return null;
  }
}
