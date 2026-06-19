import argon2 from "argon2";
import { findByLoginId, createUser } from "../repositories/userRepository.js";
import type { UserRow } from "../repositories/userRepository.js";

export async function register(
  loginId: string,
  password: string,
  userName: string,
): Promise<void> {
  const existing = await findByLoginId(loginId);
  if (existing) {
    throw new Error("このログインIDは既に使われています");
  }

  // パスワードをハッシュ化（salt等は argon2 が自動）
  const passwordHash = await argon2.hash(password);

  // 保存
  await createUser(loginId, passwordHash, userName);
}

export async function login(
  loginId: string,
  password: string,
): Promise<UserRow> {
  const user = await findByLoginId(loginId);
  if (!user) {
    throw new Error("ログインIDまたはパスワードが違います");
  }

  // パスワードの検証
  const ok = await argon2.verify(user.password, password);
  if (!ok) {
    throw new Error("ログインIDまたはパスワードが違います");
  }
  return user;
}
