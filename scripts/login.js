const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (eventElement) => {
  eventElement.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  sendRequestForLogin(email, password).then((userData) => {
    if (userData) {
      console.log("User data:", userData.user);
    }
  });
});

let user = {};

function sendRequestForLogin(email, password) {
  isLoading = true;
  errorMessage = "";

  return fetch("https://karyar-library-management-system.liara.run/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      const { status, ok } = response;
      console.log("Response status:", status, ok);

      return response
        .json()
        .then((data) => ({ ok, data }))
        .catch(() => ({ ok, data: {} }));
    })
    .then(({ ok, data }) => {
      if (ok) {
        console.log("Login success:", data);
        alert("✅ Login successful!");
        return data;
      } else {
        errorMessage = data.message || "Wrong email or password";
        console.log("Server error:", errorMessage);
        showError(errorMessage);
      }
    })
    .catch((error) => {
      console.log("Network error:", error);
      showError("There was a problem connecting to the server");
    })
    .finally(() => {
      isLoading = false;
    });
}

function showError(msg) {
  const alertContainer = document.getElementById("alert-container");
  alertContainer.innerHTML = `<div class="alert alert-error">${msg}</div>`;
}
