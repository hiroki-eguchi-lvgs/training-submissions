// ===== URLから店舗IDを取り出す =====
const params = new URLSearchParams(location.search); // "?id=4" を解析
const storeId = params.get("id"); // "4"（文字列）

const errorMessage = document.getElementById("error-message");

// ===== ログアウト（main.jsと同じ）=====
setupLogout();

// ===== 描画：店舗の基本情報 =====
function renderInfo(store) {
  document.getElementById("store-name").textContent = store.store_name;
  document.getElementById("store-meta").textContent =
    `${store.address} ・ ★ ${store.avg_rating ?? "評価なし"} (${store.review_count}件)`;
  document.getElementById("store-info").style.display = "block";
}

// ===== 描画：営業時間 =====
function renderHours(hours) {
  const list = document.getElementById("hours-list");
  if (hours.length === 0) {
    list.textContent = "登録なし";
  } else {
    hours.forEach((hour) => {
      const row = document.createElement("div");
      row.textContent = `${hour.open_time}〜${hour.close_time}`;
      list.appendChild(row);
    });
  }
  document.getElementById("hours-card").style.display = "block";
}

// ===== 描画：レビュー =====
function renderReviews(reviews) {
  const list = document.getElementById("reviews-list");
  if (reviews.length === 0) {
    list.textContent = "まだレビューはありません";
  } else {
    reviews.forEach((review) => {
      const card = document.createElement("div");
      card.className = "card";

      const head = document.createElement("div");
      head.textContent = `${review.user_name} ・ ★ ${review.rating}`;

      const body = document.createElement("div");
      body.textContent = review.content; // ← ユーザー入力なので textContent で無害化

      card.appendChild(head);
      card.appendChild(body);
      list.appendChild(card);
    });
  }
  document.getElementById("reviews-card").style.display = "block";
}

// ===== 起動（ガード → 取得 → 描画）=====
async function init() {
  const meRes = await fetch("/me");
  if (!meRes.ok) {
    location.href = "login.html";
    return;
  }

  if (!storeId) {
    errorMessage.textContent = "店舗IDが指定されていません";
    return;
  }

  const res = await fetch(`/stores/${storeId}`);
  if (!res.ok) {
    errorMessage.textContent = "店舗が見つかりませんでした";
    return;
  }

  const store = await res.json();
  renderInfo(store);
  renderHours(store.hours);
  renderReviews(store.reviews);
}

init();
