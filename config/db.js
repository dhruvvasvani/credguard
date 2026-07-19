const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = path.resolve(__dirname, '../credguard.db');

// Connect to SQLite database (this will create credguard.db if it doesn't exist)
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ SQLite Database connection failed:', err.message);
    } else {
        console.log(`✅ SQLite Database connected successfully (stored in ${dbPath})`);
    }
});

// Initialize the database tables
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

// Wrapper to mimic the mysql2 promise API so we don't have to change the controllers
const promisePool = {
    execute: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            // Check if it's a SELECT query
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    // return [rows, fields] format to match mysql2
                    else resolve([rows, []]); 
                });
            } else {
                // INSERT, UPDATE, DELETE queries
                db.run(sql, params, function(err) {
                    if (err) reject(err);
                    else {
                        // return result object similar to mysql2
                        resolve([{ insertId: this.lastID, affectedRows: this.changes }, []]);
                    }
                });
            }
        });
    }
};

module.exports = promisePool;
