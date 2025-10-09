# 📚 Library Management System

A simple and modern **Library Management System** built with **HTML**, **CSS**, and **JavaScript**, designed to help users **browse, borrow, and return books** easily.  
It uses **API authentication** for user login and signup, and **Local Storage** to keep track of borrowed books and availability status.

---

## 🚀 Features

- 🔐 **User Authentication**

  - Login and signup using API
  - Cookie-based session handling

- 📖 **Book Management**

  - Displays a list of available books
  - Each book shows details like **title**, **author**, and **ISBN**

- 📦 **Borrow & Return System**

  - Borrow books and automatically reduce their availability
  - Return books and restore the stock
  - Borrowed books are saved in **Local Storage**

- 🧾 **User Loans Page**

  - Shows a list of books currently borrowed by the logged-in user
  - Allows returning books directly from this page

- 🧭 **Navigation**
  - Clean and simple UI with different pages:
    - Login / Signup
    - Books list
    - Borrowed books (Loans)

---

## 🧠 Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **API:** Custom REST API (hosted on Liara platform)
- **Storage:** Local Storage (for user-side data persistence)
- **Authentication:** Token & Cookie-based system

---

## ⚙️ How It Works

1. User logs in or signs up using the API.
2. A session token is stored in a cookie.
3. Available books are fetched and displayed dynamically.
4. When a user borrows a book:
   - Its availability decreases.
   - The borrowed book is saved in Local Storage.
5. When the user returns a book:
   - The book is removed from Local Storage.
   - The availability increases again.

---

## 👾 AI helps

1. اصلاح Css برای نمایش اطلاعات بیشتر در مورد کتاب ها به صورت پشت و رو کارت
2. مدیریت تاریخ در بخش امانت گرفتن کتاب ها و نمایش تاریخ در بخش loans table
3. اضافه کردن Event Delegation برای بازگردانی کتاب
4. اضافه کردن اطلاعات Loans ID به اتریبیوت های html برای هندل شدن آیدی کتابی که قصد برگرداندن اون رو داریم.
