-- Database creation
CREATE DATABASE IF NOT EXISTS credguard;
USE credguard;

-- Users table schema
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(18) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    age INT NULL,
    country VARCHAR(50) NULL,
    state VARCHAR(50) NULL,
    city VARCHAR(50) NULL,
    pincode VARCHAR(10) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
