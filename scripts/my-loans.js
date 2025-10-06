function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

async function fetchCurrentUser(token) {
  try {
    const response = await fetch("https://karyar-library-management-system.liara.run/api/auth/me", {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fetchUserLoans(token) {
  try {
    const response = await fetch(
      "https://karyar-library-management-system.liara.run/api/loans/my-loans",
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error:", error);
  }
}

const authToken = getCookie("token");
if (!authToken) {
  window.location.href = "../login.html";
}
fetchCurrentUser(authToken).then((response) => {
  document.querySelector(".user-avatar").innerText = response.data.user.firstName[0];
  document.querySelector(".user-info span").innerText = response.data.user.firstName;
  response.data.user.firstName;
});

async function returnLoan(loanId) {
  try {
    const response = await fetch(
      `https://karyar-library-management-system.liara.run/api/loans/${loanId}/return`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + authToken },
      }
    );
    if (response.ok) {
      loadingLoans();
    } else {
      console.error("Error returning book");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function loadingLoans() {
  const response = await fetchUserLoans(authToken);
  document.querySelectorAll(".stat-number")[0].innerText = response.data.length - response.data;
  if (response) {
    const innerTable = document.querySelector(".table tbody");
    innerTable.innerHTML = "";

    const loans = response.data;
    document.querySelector(".card-header span").innerText = "Total: " + loans.length + " loans";
    document.querySelectorAll(".stat-number")[0].innerText = loans.filter(
      (loan) => loan.status === "active"
    ).length;
    document.querySelectorAll(".stat-number")[1].innerText = loans.filter(
      (loan) => loan.status === "returned"
    ).length;

    loans.forEach((loan) => {
      const loanDate = new Date(loan.loanDate).toISOString().split("T")[0];
      const statusText = String(loan.status).charAt(0).toUpperCase() + String(loan.status).slice(1);
      let buttonHtml = "";
      if (loan.status === "active") {
        buttonHtml = `<button class="btn btn-success btn-sm" data-loan-id="${loan.id}">Return</button>`;
      } else {
        buttonHtml = '<button class="btn btn-secondary btn-sm" disabled>Returned</button>';
      }
      const loanItem = document.createElement("tr");
      loanItem.innerHTML = `
        <td>
          <strong>${loan.book.title}</strong>
          <br>
          <small style="color: #666;">ISBN: ${loan.book.isbn}</small>
        </td>
        <td>${loan.book.author}</td>
        <td>${loanDate}</td>
        <td><span class="status status-${loan.status}">${statusText}</span></td>
        <td>
          ${buttonHtml}
        </td>
      `;
      innerTable.appendChild(loanItem);
    });
  }
}

document.querySelector(".table tbody").addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-success")) {
    const loanId = e.target.dataset.loanId;
    if (loanId) {
      const confirmed = confirm("Are you sure you want to return this book?");
      if (confirmed) {
        returnLoan(loanId);
      }
    }
  }
});

loadingLoans();
