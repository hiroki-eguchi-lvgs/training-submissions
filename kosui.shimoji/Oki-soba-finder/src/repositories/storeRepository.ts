import { pool } from "../db/pool.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export type StoreRow = {
  id: number;
  store_name: string;
  address: string;
  latitude: string;
  longitude: string;
  serves_lunch: number; // 0 or 1
  serves_dinner: number;
  avg_rating: string | null; // AVG(DECIMAL) も文字列。レビュー0件なら null
  review_count: number; // COUNT → 件数
};

export async function findAllStores(): Promise<StoreRow[]> {
  const [rows] = await pool.query<(StoreRow & RowDataPacket)[]>(
    `SELECT
       s.id, s.store_name, s.address, s.latitude, s.longitude,
       s.serves_lunch, s.serves_dinner,
       AVG(r.rating) AS avg_rating,
       COUNT(r.id)   AS review_count
     FROM stores s
     LEFT JOIN reviews r
       ON r.store_id = s.id AND r.deleted_at IS NULL
     WHERE s.deleted_at IS NULL
     GROUP BY s.id`,
  );
  return rows;
}

// 1店＋集計（findAllStores の単店版）
export async function findStoreById(id: number): Promise<StoreRow | undefined> {
  const [rows] = await pool.query<(StoreRow & RowDataPacket)[]>(
    `SELECT
       s.id, s.store_name, s.address, s.latitude, s.longitude,
       s.serves_lunch, s.serves_dinner,
       AVG(r.rating) AS avg_rating,
       COUNT(r.id)   AS review_count
     FROM stores s
     LEFT JOIN reviews r ON r.store_id = s.id AND r.deleted_at IS NULL
     WHERE s.id = ? AND s.deleted_at IS NULL
     GROUP BY s.id`,
    [id],
  );
  return rows[0];
}

// 営業時間（複数）
export type HoursRow = { open_time: string; close_time: string };

export async function findHoursByStoreId(storeId: number): Promise<HoursRow[]> {
  const [rows] = await pool.query<(HoursRow & RowDataPacket)[]>(
    `SELECT open_time, close_time
       FROM store_hours
      WHERE store_id = ?
      ORDER BY open_time`,
    [storeId],
  );
  return rows;
}

// レビュー＋投稿者名（reviews JOIN users）
export type ReviewRow = {
  id: number;
  rating: number;
  user_name: string;
  content: string;
  created_at: string;
};

export async function findReviewsByStoreId(
  storeId: number,
): Promise<ReviewRow[]> {
  const [rows] = await pool.query<(ReviewRow & RowDataPacket)[]>(
    `SELECT r.id, r.rating, u.user_name, r.content, r.created_at
       FROM reviews r
       JOIN users u ON u.id = r.user_id
      WHERE r.store_id = ? AND r.deleted_at IS NULL
      ORDER BY r.created_at DESC`,
    [storeId],
  );
  return rows;
}

export async function createStore(
  store_name: string,
  address: string,
  latitude: number,
  longitude: number,
  serves_lunch: boolean,
  serves_dinner: boolean,
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO stores
       (store_name, address, latitude, longitude, serves_lunch, serves_dinner)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      store_name,
      address,
      latitude,
      longitude,
      serves_lunch ? 1 : 0,
      serves_dinner ? 1 : 0,
    ],
  );
  return result.insertId;
}

export async function updateStore(
  id: number,
  store_name: string,
  address: string,
  latitude: number,
  longitude: number,
  serves_lunch: boolean,
  serves_dinner: boolean,
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE stores
       SET store_name = ?, address = ?, latitude = ?, longitude = ?,
            serves_lunch = ?, serves_dinner = ?
      WHERE id = ? AND deleted_at IS NULL`,
    [
      store_name,
      address,
      latitude,
      longitude,
      serves_lunch ? 1 : 0,
      serves_dinner ? 1 : 0,
      id,
    ],
  );

  return result.affectedRows;
}

export async function softDeleteStore(id: number): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE stores SET deleted_at = NOW()
      WHERE id = ? AND deleted_at IS NULL`,
    [id],
  );
  return result.affectedRows;
}
