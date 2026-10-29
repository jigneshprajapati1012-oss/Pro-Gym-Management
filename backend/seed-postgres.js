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

async function seedPostgres() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('Restoring demo members...');

    const trainers = await client.query(`
      SELECT
        t.id,
        t.user_id,
        u.email,
        u.name
      FROM trainers t
      JOIN users u ON u.id = t.user_id
      ORDER BY t.id
    `);

    console.table(trainers.rows);

    if (trainers.rows.length < 2) {
      throw new Error(
        'Expected at least 2 trainers in PostgreSQL.'
      );
    }

    const trainerOneId = trainers.rows[0].id;
    const trainerTwoId = trainers.rows[1].id;

    const existingMembers = await client.query(`
      SELECT COUNT(*) AS count
      FROM members
    `);

    if (Number(existingMembers.rows[0].count) > 0) {
      console.log('Members already exist. Nothing was added.');
      await client.query('ROLLBACK');
      return;
    }

    const addMember = `
      INSERT INTO members (
        full_name,
        photo_url,
        dob,
        gender,
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
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15
      )
      RETURNING id, full_name
    `;

    const today = new Date();

    function dateAfter(days) {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    }

    function dateBefore(days) {
      const date = new Date(today);
      date.setDate(date.getDate() - days);
      return date.toISOString().split('T')[0];
    }

    const memberOne = await client.query(addMember, [
      'Aarav Patel',
      null,
      '2000-05-12',
      'Male',
      '9000000011',
      'aarav@example.com',
      'Gandhinagar, Gujarat',
      '9000000091',
      'Monthly',
      dateBefore(15),
      dateAfter(15),
      'Paid',
      trainerOneId,
      dateBefore(15),
      'General fitness training.'
    ]);

    const memberTwo = await client.query(addMember, [
      'Diya Shah',
      null,
      '1999-09-20',
      'Female',
      '9000000012',
      'diya@example.com',
      'Gandhinagar, Gujarat',
      '9000000092',
      'Quarterly',
      dateBefore(40),
      dateAfter(50),
      'Paid',
      trainerTwoId,
      dateBefore(40),
      'Functional fitness training.'
    ]);

    const memberThree = await client.query(addMember, [
      'Harsh Mehta',
      null,
      '1998-02-14',
      'Male',
      '9000000013',
      'harsh@example.com',
      'Gandhinagar, Gujarat',
      '9000000093',
      'Monthly',
      dateBefore(25),
      dateAfter(5),
      'Pending',
      trainerOneId,
      dateBefore(25),
      'Membership renewal is pending.'
    ]);

    console.log('Added members:');
    console.table([
      memberOne.rows[0],
      memberTwo.rows[0],
      memberThree.rows[0]
    ]);

    await client.query('COMMIT');

    console.log('');
    console.log('PostgreSQL demo members restored successfully.');
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('');
    console.error('ERROR:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedPostgres();