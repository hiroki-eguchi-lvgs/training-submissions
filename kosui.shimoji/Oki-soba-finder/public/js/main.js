const map = L.map("map").setView([35.658, 139.7016], 15);

L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
  attribution: "地理院タイル",
}).addTo(map);

function pinColor(store) {
  if (store.serves_lunch && store.serves_dinner) return "#534AB7"; // 両方=紫
  if (store.serves_lunch) return "#1D9E75"; // 昼=緑
  if (store.serves_dinner) return "#BA7517"; // 夜=橙
  return "#888780"; // 保険=灰
}

function typeLabel(store) {
  if (store.serves_lunch && store.serves_dinner) return "両方";
  if (store.serves_lunch) return "昼";
  if (store.serves_dinner) return "夜";
  return "—";
}

async function loadStores() {
  const res = await fetch("/stores");
  const stores = await res.json();

  stores.forEach((store) => {
    const color = pinColor(store);

    L.circleMarker([store.latitude, store.longitude], {
      radius: 9,
      color: color,
      fillColor: color,
      fillOpacity: 0.9,
      weight: 2,
    })
      .addTo(map)
      .bindPopup(
        `${store.store_name}<br>★ ${store.avg_rating ?? "評価なし"} (${store.review_count}件)<br>${typeLabel(store)}`,
      );
  });
}

loadStores();
