import {
  findAllStores,
  findStoreById,
  findHoursByStoreId,
  findReviewsByStoreId,
  createStore,
  softDeleteStore,
  updateStore,
} from "../repositories/storeRepository.js";
import { geocode } from "../repositories/geocodeGateway.js";
import type { HoursRow, ReviewRow } from "../repositories/storeRepository.js";

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

export type StoreDetail = {
  id: number;
  store_name: string;
  address: string;
  latitude: number;
  longitude: number;
  serves_lunch: boolean;
  serves_dinner: boolean;
  avg_rating: number | null;
  review_count: number;
  hours: HoursRow[];
  reviews: ReviewRow[];
};

export async function getStoreDetail(id: number): Promise<StoreDetail | null> {
  const store = await findStoreById(id);
  if (!store) {
    return null; // 店が無い → route が 404 にする
  }

  const hours = await findHoursByStoreId(id);
  const reviews = await findReviewsByStoreId(id);

  return {
    id: store.id,
    store_name: store.store_name,
    address: store.address,
    latitude: Number(store.latitude),
    longitude: Number(store.longitude),
    serves_lunch: store.serves_lunch === 1,
    serves_dinner: store.serves_dinner === 1,
    avg_rating:
      store.avg_rating === null
        ? null
        : Math.round(Number(store.avg_rating) * 10) / 10,
    review_count: store.review_count,
    hours,
    reviews,
  };
}

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

export type CreateStoreInput = {
  store_name: string;
  address: string;
  serves_lunch: boolean;
  serves_dinner: boolean;
};

export async function addStore(
  input: CreateStoreInput,
): Promise<{ id: number }> {
  const coords = await geocode(input.address); //  住所→座標（Gateway・外部API）
  const id = await createStore(
    // 座標つきで保存（Repository・DB）
    input.store_name,
    input.address,
    coords.latitude,
    coords.longitude,
    input.serves_lunch,
    input.serves_dinner,
  );
  return { id };
}

export async function removeStore(id: number): Promise<boolean> {
  const affected = await softDeleteStore(id);
  return affected > 0;
}

export async function editStore(
  id: number,
  input: CreateStoreInput,
): Promise<boolean> {
  const coords = await geocode(input.address);
  const affected = await updateStore(
    id,
    input.store_name,
    input.address,
    coords.latitude,
    coords.longitude,
    input.serves_lunch,
    input.serves_dinner,
  );
  return affected > 0;
}
