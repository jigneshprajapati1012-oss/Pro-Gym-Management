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

async function checkAttendance() {
  try {
    console.log('Checking attendance table...\n');

    const columns = await pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'attendance'
      ORDER BY ordinal_position
    `);

    console.table(columns.rows);

    console.log('\nExisting attendance records:\n');

    const records = await pool.query(`
      SELECT *
      FROM public.attendance
      ORDER BY id
      LIMIT 20
    `);

    console.table(records.rows);

  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await pool.end();
  }
}

checkAttendance();