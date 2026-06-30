// ===== 全ページ共通のユーティリティ =====

// ログアウトリンクに「クリック→/logout→login.htmlへ」を仕込む
function setupLogout() {
  const link = document.getElementById("logout-link");
  if (!link) return; // ログアウトリンクが無いページでは何もしない
  link.addEventListener("click", async (event) => {
    event.preventDefault();
    await fetch("/logout", { method: "POST" });
    location.href = "login.html";
  });
}
