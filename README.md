# CredGuard API

A production-ready, secure RESTful API for User Authentication and Profile Management. Built with Node.js, Express, MySQL, JWT, and bcrypt, **CredGuard** acts as a robust backend foundation for modern web and mobile applications.

## Overview: What is CredGuard?

CredGuard API is a standalone backend service designed to handle the complexities of user authentication securely. Instead of building a login system from scratch for every new project, developers can integrate CredGuard into their frontend applications (such as React, Vue, or Flutter apps) to manage user accounts, hash passwords, and protect sensitive routes.

### Key Benefits
- **Plug-and-Play Security**: Offloads the heavy lifting of security by handling password hashing (`bcrypt`) and session token generation (`JWT`).
- **Standardized**: Follows RESTful API standards, making it simple to integrate with any frontend client.
- **Protection Against Abuse**: Built-in rate limiting prevents brute-force login attempts and API spamming.
- **Data Integrity**: Enforces strict input validation to ensure only clean, properly formatted data enters your database.

---

## Features

- **User Registration**: Secure password hashing before saving to a MySQL database.
- **User Login & Authorization**: Issues JSON Web Tokens (JWT) upon successful verification.
- **Profile Management**: Protected API routes to fetch (`GET`) and update (`PUT`) user details.
- **Security Layers**: JWT validation, IP-based rate limiting, and secure password handling.
- **Input Validation**: Request body validation using `express-validator`.

---

## System Requirements & Constraints

To deploy or test this API locally, your system must meet the following prerequisites:

- **Node.js**: v14.x or higher
- **npm**: v6.x or higher
- **MySQL**: v5.7 or v8.0+ installed and running locally
- **Git** (optional, for cloning the repository)

### Built-in Rate Limits
To ensure stability and security, the API enforces the following limits:
- **Authentication Endpoints (Login/Register)**: Maximum 5 requests per 15 minutes per IP address.
- **General Endpoints**: Maximum 100 requests per 15 minutes per IP address.

---

## Step-by-Step Setup Guide

Follow these steps to get the API running on your local machine:

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd credguard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Configuration
1. Open your MySQL command line or a GUI tool (like MySQL Workbench or phpMyAdmin).
2. Create a new database and run the provided `database.sql` script to structure the `users` table:
```bash
mysql -u root -p < database.sql
```

### 4. Environment Variables
Duplicate the `.env.example` file, rename it to `.env`, and fill in your local MySQL credentials:
```bash
cp .env.example .env
```
*Example `.env` configuration:*
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=credguard_db
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_123!
```

### 5. Start the Server
Launch the development server:
```bash
npm run dev
```
*The server will start listening on `http://localhost:5000`.*

---

## How to Test the API

Since this is a backend service without a graphical user interface, you must use an API testing client like [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/). 

Follow this workflow to test the endpoints:

### Step 1: Register a New User
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/register`
- **Body** (raw JSON):
  ```json
  {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "password": "strongPassword123"
  }
  ```

### Step 2: Log In to Get a Token
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/auth/login`
- **Body** (raw JSON):
  ```json
  {
    "email": "rahul@example.com",
    "password": "strongPassword123"
  }
  ```
- **Response**: Upon success, you will receive a response containing a `token`. **Copy this token string.**

### Step 3: Access a Protected Route (View Profile)
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/profile`
- **Headers**:
  - Add a new key named `Authorization`.
  - Set the value to `Bearer <paste_your_copied_token_here>` (ensure there is a space after "Bearer").
- **Response**: The API will verify your token and securely return the user's profile data.

---

## Contributing
Contributions are welcome! Feel free to open issues or submit pull requests if you want to improve the CredGuard API.
