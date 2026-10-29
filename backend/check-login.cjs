require('dotenv').config();

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
host: process.env.DB_HOST,
port: Number(process.env.DB_PORT || 5432),
database: process.env.DB_NAME,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
ssl: { rejectUnauthorized: false }
});

async function checkLogin() {
try {
const result = await pool.query(`       SELECT email, password_hash
      FROM public.users
      WHERE LOWER(email) IN (
        'owner@sfwthegym.local',
        'trainer1@sfwthegym.local',
        'trainer2@sfwthegym.local'
      )
      ORDER BY id
    `);


if (result.rows.length === 0) {
  console.log('RESULT: No accounts found in this database.');
  return;
}

for (const user of result.rows) {
  const isOwner = user.email.toLowerCase() ===
    'owner@sfwthegym.local';

  const password = isOwner
    ? 'GymOwner@2026'
    : 'GymTrainer@2026';

  console.log(
    user.email,
    '| Password matches stored hash:',
    bcrypt.compareSync(password, user.password_hash)
  );
}

} catch (error) {
  console.error('Diagnostic error:', error);
  console.error('Stack trace:', error.stack);
} finally {
await pool.end();
}
}

checkLogin();
