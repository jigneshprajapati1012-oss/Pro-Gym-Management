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

async function restoreMembers() {
  try {
    console.log('Restoring demo members...');

    await pool.query(`
      INSERT INTO public.members
      (
        full_name,
        phone,
        email,
        address,
        emergency_contact,
        membership_type,
        start_date,
        expiry_date,
        payment_status,
        assigned_trainer_id,
        registration_date,
        notes
      )
      VALUES
      (
        'Aarav Patel',
        '9876543210',
        'aarav@example.com',
        'Gandhinagar, Gujarat',
        '9876500001',
        'Monthly',
        '2026-09-01',
        '2026-10-01',
        'Paid',
        1,
        '2026-09-01',
        'Demo member'
      ),
      (
        'Diya Shah',
        '9876543211',
        'diya@example.com',
        'Gandhinagar, Gujarat',
        '9876500002',
        'Quarterly',
        '2026-09-01',
        '2026-12-01',
        'Paid',
        2,
        '2026-09-01',
        'Demo member'
      ),
      (
        'Harsh Mehta',
        '9876543212',
        'harsh@example.com',
        'Gandhinagar, Gujarat',
        '9876500003',
        'Monthly',
        '2026-09-01',
        '2026-10-01',
        'Pending',
        1,
        '2026-09-01',
        'Demo member'
      )
    `);

    console.log('');
    console.log('Demo members restored successfully.');

  } catch (error) {
    console.error('');
    console.error('ERROR:', error.message);
  } finally {
    await pool.end();
  }
}

restoreMembers();