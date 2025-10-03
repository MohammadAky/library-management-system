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
  //   console.log(response.data);
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
  }
}

async function loadingBooks() {
  const cacheDuration = 5 * 60 * 1000;
  const savedBooks = localStorage.getItem("Books");

  if (savedBooks) {
    const cacheData = JSON.parse(savedBooks);

    if (Date.now() - cacheData.timestamp < cacheDuration) {
      console.log("Books loaded from localStorage (valid cache):", cacheData.books);
      displayBooks(cacheData.books); // display books from chache
      return;
    } else {
      console.log("Cache expired, removing old data and fetching from API");
      localStorage.removeItem("Books"); // remove expired cached books
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
      console.log("hi");
    });

    const viewDetailsBtn = card.querySelector(".btn.btn-secondary.btn-sm");
    viewDetailsBtn.addEventListener("click", async () => {
      bookInfo = await getDetailsBook(book.id);

      if (bookInfo) {
        card.querySelector(".publisher").innerHTML =
          "<strong>Publisher:</strong> " + bookInfo.publisher || "Unknown";
        card.querySelector(".publicationYear").innerHTML =
          "<strong>Publication Year:</strong> " + bookInfo.publicationYear || "Unknown";
        card.querySelector(".description").innerHTML =
          "<strong>Description:</strong> " + bookInfo.description ?? "N/A";
      }

      card.classList.add("flipped");
      card.querySelector(".flip-back").addEventListener("click", () => {
        card.classList.remove("flipped");
      });
    });
  });
}
async function borrowBook(_bookId, _userId, _loanPeriod, _dueDate) {
  try {
    const response = await fetch("https://karyar-library-management-system.liara.run/api/loans", {
      method: "",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + authToken },
      body: JSON.stringify({
        bookId: _bookId,
        userId: _userId,
        loanPeriod: _loanPeriod,
        dueDate: _dueDate,
      }),
    });
    console.log(response.json());
  } catch (error) {
    console.log(error);
  }
}
loadingBooks();
