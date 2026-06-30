import { pool } from "../db/pool.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export type UserRow = {
  id: number;
  login_id: string;
  password: string;
  user_name: string;
  role: string;
};

// login_id で1件取得（重複チェック・ログインで使う）
export async function findByLoginId(
  loginId: string,
): Promise<UserRow | undefined> {
  const [rows] = await pool.query<(UserRow & RowDataPacket)[]>(
    "SELECT id, login_id, password, user_name, role FROM users WHERE login_id = ?",
    [loginId],
  );
  return rows[0];
}

// 新規ユーザーを作成
export async function createUser(
  loginId: string,
  passwordHash: string,
  userName: string,
): Promise<void> {
  await pool.query(
    "INSERT INTO users (login_id, password, user_name) VALUES (?, ?, ?)",
    [loginId, passwordHash, userName],
  );
}

// 役割を変更する（admin / user）
export async function updateUserRole(
  id: number,
  role: string,
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE users SET role = ? WHERE id = ?",
    [role, id],
  );
  return result.affectedRows;
}

// 一覧用（passwordは含めない）
export type UserListRow = {
  id: number;
  login_id: string;
  user_name: string;
  role: string;
};

export async function findAllUsers(): Promise<UserListRow[]> {
  const [rows] = await pool.query<(UserListRow & RowDataPacket)[]>(
    "SELECT id, login_id, user_name, role FROM users ORDER BY id",
  );
  return rows;
}
