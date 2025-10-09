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

    if (response.status === 401) {
      window.location.href = "../login.html";
      return null;
    }

    const data = await response.json();

    return data.data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

const authToken = getCookie("token");
if (!authToken) {
  window.location.href = "../login.html";
}
fetchCurrentUser(authToken).then((response) => {
  if (!response) return;

  document.querySelector(".user-info span").innerText = response.user.firstName;
  document.querySelector(".user-avatar").innerText = response.user.firstName[0];
  localStorage.setItem("User", JSON.stringify(response.user));
});

async function fetchBooks(token) {
  try {
    const response = await fetch("https://karyar-library-management-system.liara.run/api/books", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const data = await response.json();

    const cacheData = {
      books: data.data,
      timestamp: Date.now(),
    };
    localStorage.setItem("Books", JSON.stringify(cacheData));

    return data;
  } catch (error) {
    console.log("Error:", error);
    return null;
  }
}

async function loadingBooks() {
  const cacheDuration = 5 * 60 * 1000;
  const savedBooks = localStorage.getItem("Books");

  if (savedBooks) {
    try {
      const cacheData = JSON.parse(savedBooks);

      if (Date.now() - cacheData.timestamp < cacheDuration) {
        console.log("Books loaded from localStorage (valid cache):", cacheData.books);
        displayBooks(cacheData.books);
        return;
      } else {
        console.log("Cache expired, removing old data and fetching from API");
        localStorage.removeItem("Books");
      }
    } catch (parseError) {
      console.error("Error parsing cached books:", parseError);
      localStorage.removeItem("Books");
    }
  }
  const response = await fetchBooks(authToken);
  if (response && response.data) {
    console.log("Books fetched from API:", response.data);
    displayBooks(response.data);
  } else {
    console.error("Failed to load books from API");
    const booksGrid = document.querySelector(".grid.grid-3");
    booksGrid.innerHTML =
      "<p style='color: red;'>Unable to load books. Please try again later.</p>";
  }
}
async function getDetailsBook(BookId) {
  try {
    const response = await fetch(
      `https://karyar-library-management-system.liara.run/api/books/${BookId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const bookData = await response.json();
    return bookData;
  } catch (error) {
    console.log(error);
    return null;
  }
}
function displayBooks(books) {
  const booksGrid = document.querySelector(".grid.grid-3");
  booksGrid.innerHTML = "";

  books.forEach((book) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-inner">
        <!-- Front side -->
        <div class="card-front">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <h3 style="margin: 0; color: #2c3e50;">${book.title}</h3>
            <span class="status status-${book.available ? "available" : "unavailable"}">
              ${book.available ? "Available" : "Unavailable"}
            </span>
          </div>
          <p style="color: #666; margin-bottom: 0.5rem;"><strong>Author:</strong> ${book.author}</p>
          <p style="color: #666; margin-bottom: 0.5rem;"><strong>ISBN:</strong> ${book.isbn}</p>
          <p style="color: #666; margin-bottom: 0.5rem;"><strong>Category:</strong> ${
            book.category.name
          }</p>
          <p style="color: #666; margin-bottom: 1rem;"><strong>Available Copies:</strong> ${
            book.availableCopies
          }</p>
          <p style="margin-bottom: 1rem; font-size: 0.9rem; color: #555;">${book.description}</p>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-primary btn-sm">Borrow Book</button>
            <button class="btn btn-secondary btn-sm">View Details</button>
          </div>
        </div>

        <!-- Back side -->
        <div class="card-back">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <h3 style="margin: 0; color: #2c3e50;">${book.title}</h3>
            <span class="status status-${book.available ? "available" : "unavailable"}">
              ${book.available ? "Available" : "Unavailable"}
            </span>
          </div>
          <p class="publisher" style="color: #666; margin-bottom: 0.5rem;"><strong>Publisher:</strong> Loading...</p>
          <p class="publicationYear" style="color: #666; margin-bottom: 0.5rem;"><strong>Publication Year:</strong> Loading...</p>
          <p class="description" style="color: #666; margin-bottom: 0.5rem;"><strong>Description:</strong> Loading...</p>
          <button class="btn btn-secondary btn-sm flip-back">Back</button>
        </div>
      </div>
    `;
    booksGrid.appendChild(card);

    const borrowBookBtn = card.querySelector(".btn.btn-primary.btn-sm");
    borrowBookBtn.addEventListener("click", () => {
      const confirmed = confirm(`Are you sure you want to borrow "${book.title}"?`);
      if (confirmed) {
        borrowBook(book.id);
      }
    });

    const viewDetailsBtn = card.querySelector(".btn.btn-secondary.btn-sm");
    viewDetailsBtn.addEventListener("click", async () => {
      let bookInfo = await getDetailsBook(book.id);

      if (bookInfo) {
        card.querySelector(".publisher").innerHTML =
          "<strong>Publisher:</strong> " + bookInfo.publisher || "Unknown";
        card.querySelector(".publicationYear").innerHTML =
          "<strong>Publication Year:</strong> " + bookInfo.publicationYear || "Unknown";
        card.querySelector(".description").innerHTML =
          "<strong>Description:</strong> " + bookInfo.description ?? "N/A";
      } else {
        card.querySelector(".publisher").innerHTML = "<strong>Publisher:</strong> Unknown";
        card.querySelector(".publicationYear").innerHTML =
          "<strong>Publication Year:</strong> Unknown";
        card.querySelector(".description").innerHTML =
          "<strong>Description:</strong> Unable to load";
      }

      card.classList.add("flipped");
      card.querySelector(".flip-back").addEventListener("click", () => {
        card.classList.remove("flipped");
      });
    });
  });
}

async function borrowBook(_bookId) {
  try {
    const userData = localStorage.getItem("User");
    if (!userData) {
      console.error("User data not found");
      return;
    }

    const user = JSON.parse(userData);
    const loanPeriod = 14;
    const dueDate = new Date(Date.now() + loanPeriod * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const response = await fetch("https://karyar-library-management-system.liara.run/api/loans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + authToken,
      },
      body: JSON.stringify({
        bookId: _bookId,
        userId: user.id,
        loanPeriod: loanPeriod,
        dueDate: dueDate,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Book borrowed successfully:", result);

    const savedBooks = JSON.parse(localStorage.getItem("Books"));
    if (savedBooks && savedBooks.books) {
      const bookIndex = savedBooks.books.findIndex((b) => b.id === _bookId);
      if (bookIndex !== -1) {
        savedBooks.books[bookIndex].availableCopies = Math.max(
          0,
          savedBooks.books[bookIndex].availableCopies - 1
        );

        savedBooks.books[bookIndex].available = savedBooks.books[bookIndex].availableCopies > 0;

        localStorage.setItem("Books", JSON.stringify(savedBooks));
      }
    }

    displayBooks(savedBooks.books);
  } catch (error) {
    console.error("Error borrowing book:", error);
  }
}

loadingBooks();
