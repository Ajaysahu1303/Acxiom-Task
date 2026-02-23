# Acxiom Library Management System

A full-stack Library Management System developed as part of an Acxiom assignment.  
The project focuses on clean role-based access, realistic admin workflows, and simple, maintainable design.

---

## Tech Stack

- Frontend: React (Vite), Axios
- Backend: Spring Boot, Spring Data JPA
- Database: MySQL
- API Style: REST
- Authentication: Role-based (Admin / User), localStorage based

---

## Features

### User Features
- User login
- Search books by title or author
- View issued books
- View returned books
- Automatic fine calculation:
  - 7 days borrowing period
  - ₹5 per day after due date
- Secure logout with back-button prevention

---

### Admin Features
- Admin login (restricted emails)
- Add new books
- View and search all books
- Search students by email or user ID
- Student-centric workflow:
  - View student details
  - Issue book to student
  - Return issued books
  - View issued and returned books
  - Edit student fine manually if required
- Automatic handling of:
  - Issue date
  - Due date (7 days)
  - Return date
  - Fine calculation

---

## Authentication & Authorization Flow

- Login and Register pages are public and do not auto-redirect.
- Admin and User dashboards are protected using role checks before rendering.
- Unauthorized access is blocked on refresh, direct URL access, and back navigation.
- Logout clears authentication state and browser history.

---

## Fine Calculation Logic

- Due date = Issue date + 7 days
- Fine = ₹5 per day after due date
- Fine is calculated on the backend
- Admin can manually update fine for corrections or waivers

---

## Project Structure
