import { pool } from "../db/pool.js";
import type { RowDataPacket } from "mysql2";

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
