const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigrations() {
  try {
    // Connect without specifying database (to create it first)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    const sql = fs.readFileSync(path.join(__dirname, 'init-db.sql'), 'utf8');
    const statements = sql.split(';').filter((stmt) => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.query(statement);
        } catch (err) {
          if (
            err.code !== 'ER_TABLE_EXISTS_ERROR' &&
            err.code !== 'ER_DB_CREATE_EXISTS'
          ) {
            throw err;
          }
        }
      }
    }

    console.log('✅ Database tables initialized successfully');
    connection.end();
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
}

runMigrations();
