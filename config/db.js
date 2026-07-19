const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection pool to MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'credguard_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection and initialize table if needed
pool.getConnection()
    .then(async (connection) => {
        console.log(`[SUCCESS] MySQL Database connected successfully (${process.env.DB_NAME || 'credguard_db'})`);
        
        // Auto-initialize the users table just in case they haven't run database.sql manually
        try {
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('[SUCCESS] Users table is ready.');
        } catch (tableErr) {
            console.error('[ERROR] Error checking/creating users table:', tableErr.message);
        }

        connection.release();
    })
    .catch(err => {
        console.error('[ERROR] MySQL Database connection failed:', err.message);
        console.error('Make sure your local MySQL server (XAMPP/WAMP/etc.) is running and your .env credentials are correct.');
    });

module.exports = pool;
