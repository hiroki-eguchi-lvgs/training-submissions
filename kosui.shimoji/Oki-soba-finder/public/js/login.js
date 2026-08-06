const form = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.textContent = "";

  const login_id = form.login_id.value;
  const password = form.password.value;

  const res = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login_id, password }),
  });

  if (res.ok) {
    location.href = "/";
  } else {
    const data = await res.json();
    errorMessage.textContent = data.message || "ログインに失敗しました。";
  }
});
