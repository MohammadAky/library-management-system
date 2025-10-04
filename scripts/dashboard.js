function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

async function fetchCurrentUser(token) {
  try {
    const response = await fetch("https://karyar-library-management-system.liara.run/api/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}
const authToken = getCookie("token");
if (!authToken) {
  window.location.href = "../login.html";
}
fetchCurrentUser(authToken).then((response) => {
  document.querySelector("#userName").innerText = response.data.user.firstName;
  document.querySelector("#userAvatar").innerText = response.data.user.firstName[0];
  document.querySelector("#activeLoans").innerText = response.data.stats.activeLoans;
  document.querySelector("#availableBooks").innerText = response.data.stats.availableBooks;
  console.log(response.data);
});
