const pool = require('./config/db');

async function checkDatabase() {
  try {
    const conn = await pool.getConnection();

    // Get all table names
    const [tables] = await conn.query(
      `
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
    `,
      [process.env.DB_NAME || 'ualbany_campus'],
    );

    console.log('\n✅ Database tables found:');
    tables.forEach((t, i) => console.log(`  ${i + 1}. ${t.TABLE_NAME}`));

    // Get row counts for each table
    console.log('\n📊 Table row counts:');
    for (const table of tables) {
      const [result] = await conn.query(
        `SELECT COUNT(*) as count FROM \`${table.TABLE_NAME}\``,
      );
      console.log(`  ${table.TABLE_NAME}: ${result[0].count} rows`);
    }

    conn.release();
    console.log('\n✅ Database check completed!\n');
  } catch (err) {
    console.error('\n❌ Error:', err.message, '\n');
  } finally {
    process.exit(0);
  }
}

checkDatabase();
