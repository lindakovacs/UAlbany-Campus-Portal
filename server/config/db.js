const mysql = require('mysql2/promise');
require('dotenv').config();

// Deployment Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 4000,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
});

// Testing Connection
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'ualbany_campus',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// Test connection
pool
  .getConnection()
  .then((conn) => {
    console.log('✅ MySQL connected successfully');
    conn.release();
  })
  .catch((err) => console.error('❌ MySQL connection error:', err.message));

module.exports = pool;
