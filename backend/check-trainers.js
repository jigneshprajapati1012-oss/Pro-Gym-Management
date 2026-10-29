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

async function check() {
  try {
    console.log('USERS');
    console.log('====================');

    const users = await pool.query(`
      SELECT id, email, role, name
      FROM public.users
      ORDER BY id
    `);

    console.table(users.rows);

    console.log('');
    console.log('TRAINERS');
    console.log('====================');

    const trainers = await pool.query(`
      SELECT
        id,
        user_id,
        phone,
        specialization,
        experience_years,
        status
      FROM public.trainers
      ORDER BY id
    `);

    console.table(trainers.rows);

  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await pool.end();
  }
}

check();