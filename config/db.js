const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'credguard';

// Create connection pool
const pool = mysql.createPool({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Self-initializing function to setup DB and tables
(async () => {
    try {
        // Step 1: Ensure database exists
        const rootConn = await mysql.createConnection({
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: dbPassword
        });
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await rootConn.end();

        // Step 2: Test pool connection & create users table
        const connection = await pool.getConnection();
        console.log(`[SUCCESS] MySQL Database connected successfully (${dbName})`);

        // Ensure we don't drop the table on every restart
        // await connection.execute(`DROP TABLE IF EXISTS users`);
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                phone VARCHAR(15) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                age INT NULL,
                country VARCHAR(50) NULL,
                state VARCHAR(50) NULL,
                city VARCHAR(50) NULL,
                pincode VARCHAR(10) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('[SUCCESS] Users table is ready.');
        connection.release();
    } catch (err) {
        console.error('[ERROR] MySQL Database connection failed:', err.message);
        console.error('Make sure your local MySQL server is running and your .env DB_PASSWORD is correct.');
    }
})();

module.exports = pool;

