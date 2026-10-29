require('dotenv/config');

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

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

async function createUsers() {
  try {
    const ownerPassword = bcrypt.hashSync('owner123', 10);
    const trainerPassword = bcrypt.hashSync('trainer123', 10);

    await pool.query(`
      INSERT INTO public.users
        (email, password_hash, role, name)
      VALUES
        ($1, $2, 'OWNER', 'SFW Gym Owner'),
        ($3, $4, 'TRAINER', 'Rahul Patel'),
        ($5, $4, 'TRAINER', 'Neha Shah')
    `, [
      'owner@sfwthegym.local',
      ownerPassword,
      'trainer1@sfwthegym.local',
      trainerPassword,
      'trainer2@sfwthegym.local'
    ]);

    console.log('Users created successfully.');

    const result = await pool.query(`
      SELECT id, email, role, name
      FROM public.users
      ORDER BY id
    `);

    console.table(result.rows);

  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await pool.end();
  }
}

createUsers();