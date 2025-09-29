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
fetchCurrentUser(authToken).then((response) => {
  document.querySelector(".user-info span").innerText = response.data.user.firstName;
  document.querySelector(".user-avatar").innerText = response.data.user.firstName[0];
  console.log(response.data);
});
