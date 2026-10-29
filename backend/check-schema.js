require('dotenv/config');

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSchema() {
  try {
    const result = await pool.query(
      "SELECT table_name, column_name, data_type, is_nullable, column_default " +
      "FROM information_schema.columns " +
      "WHERE table_schema = 'public' " +
      "AND table_name IN ('users', 'trainers', 'members', 'attendance', 'payments', 'equipment', 'fitness_progress', 'notifications', 'gym_settings') " +
      "ORDER BY table_name, ordinal_position"
    );

    let currentTable = '';

    for (const row of result.rows) {
      if (row.table_name !== currentTable) {
        currentTable = row.table_name;

        console.log('');
        console.log('==============================');
        console.log(currentTable.toUpperCase());
        console.log('==============================');
      }

      console.log(
        row.column_name +
        ' | ' +
        row.data_type +
        ' | nullable: ' +
        row.is_nullable +
        ' | default: ' +
        row.column_default
      );
    }
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();