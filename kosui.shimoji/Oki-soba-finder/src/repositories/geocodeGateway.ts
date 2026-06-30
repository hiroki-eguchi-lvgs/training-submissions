export type Coords = { latitude: number; longitude: number };

export async function geocode(address: string): Promise<Coords> {
  const url =
    "https://msearch.gsi.go.jp/address-search/AddressSearch?q=" +
    encodeURIComponent(address);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("ジオコーディングに失敗しました");
  }

  const data = (await res.json()) as Array<{
    geometry: { coordinates: [number, number] };
  }>;
  if (data.length === 0) {
    throw new Error("住所から座標が見つかりませんでした");
  }

  // GeoJSON は [経度, 緯度] の順番
  const [longitude, latitude] = data[0]!.geometry.coordinates;
  return { latitude, longitude };
}
