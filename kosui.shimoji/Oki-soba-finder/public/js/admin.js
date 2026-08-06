import { setupLogout } from "./common.js";

setupLogout();

const errorMessage = document.getElementById("error-message");

// ===== ガード（管理者のみ）=====
async function guardAdmin() {
  const meRes = await fetch("/me");
  if (!meRes.ok) {
    location.href = "login.html"; // 未ログイン
    return false;
  }
  const meData = await meRes.json();
  if (meData.user.role !== "admin") {
    location.href = "/"; // ログイン済みだが管理者でない → トップへ
    return false;
  }
  return true;
}

// ===== 店舗追加フォーム =====
const storeForm = document.getElementById("store-form");
const storeResult = document.getElementById("store-result");

storeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  storeResult.textContent = "";

  const body = {
    store_name: storeForm.store_name.value,
    address: storeForm.address.value,
    serves_lunch: storeForm.serves_lunch.checked, // checkboxは .checked（true/false）
    serves_dinner: storeForm.serves_dinner.checked,
  };

  const res = await fetch("/admin/stores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    storeResult.textContent = "登録しました";
    storeForm.reset(); // 入力欄を空に戻す
  } else {
    const data = await res.json();
    storeResult.textContent = data.message || "登録に失敗しました";
  }
});

// ===== ユーザー一覧＋役割変更 =====
const userRows = document.getElementById("user-rows");

async function loadUsers() {
  const res = await fetch("/admin/users");
  const users = await res.json();

  userRows.innerHTML = ""; // 作り直し
  users.forEach((user) => {
    const row = document.createElement("tr");
    const idCell = document.createElement("td");
    idCell.textContent = user.id;

    const loginCell = document.createElement("td");
    loginCell.textContent = user.login_id;

    const nameCell = document.createElement("td");
    nameCell.textContent = user.user_name;

    const roleCell = document.createElement("td");
    roleCell.textContent = user.role;

    const actionCell = document.createElement("td");
    const button = document.createElement("button");
    const nextRole = user.role === "admin" ? "user" : "admin";
    button.textContent = nextRole === "admin" ? "管理者にする" : "一般にする";
    button.addEventListener("click", () => changeRole(user.id, nextRole));
    actionCell.appendChild(button);

    row.appendChild(idCell);
    row.appendChild(loginCell);
    row.appendChild(nameCell);
    row.appendChild(roleCell);
    row.appendChild(actionCell);
    userRows.appendChild(row);
  });
}

async function changeRole(id, role) {
  const res = await fetch(`/admin/users/${id}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (res.ok) {
    loadUsers(); // 変更後に一覧を取り直す
  } else {
    const data = await res.json();
    errorMessage.textContent = data.message || "変更に失敗しました";
  }
}

// ===== 起動 =====
async function init() {
  const ok = await guardAdmin();
  if (!ok) return;
  loadUsers();
}

init();
