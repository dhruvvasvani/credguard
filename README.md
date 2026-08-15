# CredGuard

**CredGuard** is a production-grade, secure RESTful API and Web Application for User Authentication, Profile Management, and Dynamic Location (Country / State / City) Lookup. Built with Node.js, Express, MySQL, JWT, Bcrypt, and a modern glassmorphism frontend user interface.

---

## Key Features

### Authentication & Profile Management
- **Flexible Login**: Support for login via Email address or Phone number (with or without country code).
- **User Registration**: Password complexity enforcement (min 8 chars, 1 uppercase, 1 number, 1 special character) and phone number validation.
- **Dynamic Location Lookups**: Full integration with `country-state-city` library providing native endpoints for fetching countries, states, and cities.
- **Interactive Dashboard**: Clean user dashboard to view user profile details and save optional location info (Age, Country, State, City, Pincode).

### Security Architecture

| Security Category | Rule / Implementation |
|---|---|
| **Token Handling** | JWTs signed with 15-minute expiration and delivered via `httpOnly`, `SameSite=Strict` secure cookies to mitigate XSS token theft. |
| **Password Hashing** | Passwords hashed using Bcrypt with **cost factor 12** (`bcrypt.genSalt(12)`). |
| **SQL Injection Prevention** | 100% parameterized queries using prepared statements (`db.execute(sql, params)`). |
| **Account Enumeration Defense** | Failed authentication attempts consistently respond with generic `"Invalid email or password"` errors. |
| **Rate Limiting & Lockout** | Auth endpoints restricted to **5 requests per 15-minute window** per IP. Tiered lockout timers trigger after consecutive failures. |
| **HTTP Security Headers** | Helmet configuration enforcing **HSTS** (`max-age=31536000`), **X-Frame-Options: DENY** (Clickjacking prevention), and **X-Content-Type-Options: nosniff**. |
| **Data Sanitization & Pollution** | Input sanitization using `xss-clean` and `hpp` parameter pollution prevention. |

---

## Project Structure

```
credguard/
├── config/
│   └── db.js                 # MySQL connection pool & automatic table initialization
├── controllers/
│   ├── authController.js     # Register, Login (with httpOnly cookie), Logout handlers
│   ├── locationController.js # Country, State, City lookup handlers
│   └── profileController.js  # GET & PUT user profile handlers
├── middleware/
│   ├── authMiddleware.js     # JWT protection middleware (supports cookie & Bearer token)
│   ├── errorMiddleware.js    # Global operational error handler
│   └── loginBruteForceLimiter.js # IP-based lockout & rate limiter
├── public/                   # Frontend assets
│   ├── index.html            # Sign-In & Sign-Up view (Glassmorphism theme)
│   ├── welcome.html          # User Dashboard view
│   ├── style.css             # Navy-blue glassmorphism styling
│   ├── app.js                # Auth UI logic & dynamic location cascading dropdowns
│   └── welcome.js            # Dashboard logic
├── routes/
│   ├── authRoutes.js         # Authentication routes (/api/auth)
│   ├── locationRoutes.js     # Location lookup routes (/api)
│   └── profileRoutes.js      # Profile management routes (/api/profile)
├── database.sql              # MySQL database setup script
├── api_tests.http            # HTTP request testing suite
├── server.js                 # Express server & security middleware setup
├── package.json              # Project dependencies
└── README.md                 # Documentation
```

---

## API Documentation

### 1. Authentication Endpoints (`/api/auth`)

#### `POST /api/auth/register`
- **Description**: Registers a new user.
- **Rate Limit**: Max 5 requests per 15 minutes per IP.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+14155552671",
    "password": "StrongPassword123!",
    "country": "United States",
    "state": "California",
    "city": "San Francisco",
    "pincode": "94105"
  }
  ```

#### `POST /api/auth/login`
- **Description**: Authenticates user via email or phone. Sets `httpOnly` JWT cookie upon success.
- **Rate Limit**: Max 5 requests per 15 minutes per IP + progressive lockout.
- **Request Body**:
  ```json
  {
    "identifier": "john@example.com",
    "password": "StrongPassword123!"
  }
  ```

#### `POST /api/auth/logout`
- **Description**: Clears authentication cookies.

---

### 2. Location Endpoints (`/api`)

- **`GET /api/countries`**: Returns all countries with ISO codes.
- **`GET /api/states/:countryCode`**: Returns states for specified country (ISO2 code, e.g. `US`, `IN`).
- **`GET /api/cities/:stateCode`**: Returns cities for specified state.

---

### 3. Profile Endpoints (`/api/profile`)

- **`GET /api/profile`**: Returns protected profile data for the authenticated user.
- **`PUT /api/profile`**: Updates optional profile details (`age`, `country`, `state`, `city`, `pincode`).

---

## Installation & Setup Guide

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **MySQL**: v8.0+ running locally or remotely

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=credguard
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=15m
FRONTEND_URL=http://localhost:5000
```

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```
Open `http://localhost:5000` in your web browser.

---

## License
MIT License. Created for secure web application development.
