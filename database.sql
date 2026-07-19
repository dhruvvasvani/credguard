-- Database creation
CREATE DATABASE IF NOT EXISTS credguard;
USE credguard;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    -- phone_number VARCHAR(20),
    -- address TEXT,
    -- age INT,
    -- gender VARCHAR(20),
    -- gov_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
