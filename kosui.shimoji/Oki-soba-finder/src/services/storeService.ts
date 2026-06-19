import { findAllStores } from "../repositories/storeRepository.js";

export type StoreListItem = {
  id: number;
  store_name: string;
  address: string;
  latitude: number; // 文字列→数値（地図が数値を要る）
  longitude: number;
  serves_lunch: boolean; // 0/1 → true/false
  serves_dinner: boolean;
  avg_rating: number | null; // 文字列→数値(小数1桁)。0件は null のまま
  review_count: number;
};

export async function listStores(): Promise<StoreListItem[]> {
  const rows = await findAllStores();

  return rows.map((row) => ({
    id: row.id,
    store_name: row.store_name,
    address: row.address,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    serves_lunch: row.serves_lunch === 1,
    serves_dinner: row.serves_dinner === 1,
    avg_rating:
      row.avg_rating === null
        ? null
        : Math.round(Number(row.avg_rating) * 10) / 10,
    review_count: row.review_count,
  }));
}
