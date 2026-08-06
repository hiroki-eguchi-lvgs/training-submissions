const form = document.getElementById("register-form");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.textContent = "";

  const login_id = form.login_id.value;
  const user_name = form.user_name.value;
  const password = form.password.value;

  const res = await fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login_id, user_name, password }),
  });

  if (res.ok) {
    location.href = "/login.html";
  } else {
    const data = await res.json();
    errorMessage.textContent = data.message || "登録に失敗しました。";
  }
});
