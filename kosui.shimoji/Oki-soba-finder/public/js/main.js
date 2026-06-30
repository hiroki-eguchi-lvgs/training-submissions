// ===== 地図の初期化 =====
const map = L.map("map").setView([35.6595, 139.7005], 14); // 渋谷駅あたり
L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
  attribution: "地理院タイル",
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map); // ピンをまとめる入れ物（後でまとめて消せる）

let allStores = []; // 取得した全店舗を保持（フィルターで使い回す）
let currentFilter = "all"; // 今の絞り込み状態

// ===== 色・ラベル =====
function pinColor(store) {
  if (store.serves_lunch && store.serves_dinner) return "#534AB7"; // 両方=紫
  if (store.serves_lunch) return "#1D9E75"; // 昼=緑
  if (store.serves_dinner) return "#BA7517"; // 夜=橙
  return "#888780";
}

function typeLabel(store) {
  if (store.serves_lunch && store.serves_dinner) return "両方";
  if (store.serves_lunch) return "昼";
  if (store.serves_dinner) return "夜";
  return "—";
}

function badgeClass(store) {
  if (store.serves_lunch && store.serves_dinner) return "both";
  if (store.serves_lunch) return "lunch";
  if (store.serves_dinner) return "dinner";
  return "";
}

// ===== 絞り込み =====
function filterStores() {
  if (currentFilter === "lunch")
    return allStores.filter((store) => store.serves_lunch);
  if (currentFilter === "dinner")
    return allStores.filter((store) => store.serves_dinner);
  return allStores;
}

// ===== 描画（ピン＋カードを作り直す）=====
function render() {
  const stores = filterStores();
  markerLayer.clearLayers(); // 前のピンを全消去
  const list = document.getElementById("store-list");
  list.innerHTML = ""; // 前のカードを全消去

  stores.forEach((store) => {
    const color = pinColor(store);

    L.circleMarker([store.latitude, store.longitude], {
      radius: 9,
      color: color,
      fillColor: color,
      fillOpacity: 0.9,
      weight: 2,
    })
      .addTo(markerLayer)
      .on("click", () => {
        location.href = `detail.html?id=${store.id}`;
      });

    const card = document.createElement("div");
    card.className = "store-card";

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = store.store_name; // ← タグ無効化

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `★ ${store.avg_rating ?? "評価なし"} (${store.review_count}件) `;

    const badge = document.createElement("span");
    badge.className = `badge ${badgeClass(store)}`; // クラス名は自分で決めた固定値→安全
    badge.textContent = typeLabel(store); // 戻り値も固定の語→安全

    meta.appendChild(badge);
    card.appendChild(name);
    card.appendChild(meta);

    card.addEventListener("click", () => {
      location.href = `detail.html?id=${store.id}`;
    });
    list.appendChild(card);
  });
}

// ===== フィルターボタン =====
document.querySelectorAll(".filters button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".filters button.active").classList.remove("active");
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    render();
  });
});

// ===== ログアウト =====
setupLogout();

// ===== 起動（ガード → 取得 → 描画）=====
async function init() {
  const meRes = await fetch("/me"); // ログイン確認
  if (!meRes.ok) {
    location.href = "login.html"; // 未ログイン → ログイン画面へ
    return;
  }
  const meData = await meRes.json();
  if (meData.user.role === "admin") {
    document.getElementById("admin-link").style.display = "inline"; // 管理者だけリンク表示
  }

  const res = await fetch("/stores");
  allStores = await res.json();
  render();
}

init();
