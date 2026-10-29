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

async function restoreTrainers() {
  try {
    console.log('Restoring demo trainers...');

    const result = await pool.query(`
      SELECT id, email, role, name
      FROM public.users
      WHERE email IN (
        'trainer1@sfwthegym.local',
        'trainer2@sfwthegym.local'
      )
      ORDER BY id
    `);

    if (result.rows.length !== 2) {
      throw new Error('Trainer users were not found.');
    }

    const trainer1 = result.rows[0];
    const trainer2 = result.rows[1];

    await pool.query(`
      INSERT INTO public.trainers
      (
        user_id,
        phone,
        specialization,
        experience_years,
        joining_date,
        status,
        bio,
        photo_url
      )
      VALUES
      (
        $1,
        '9000000001',
        'Strength Training',
        5,
        '2024-01-10',
        'Active',
        'Trainer specialising in strength and general fitness.',
        NULL
      ),
      (
        $2,
        '9000000002',
        'Cardio and Functional Training',
        4,
        '2024-06-15',
        'Active',
        'Trainer specialising in cardio and functional workouts.',
        NULL
      )
    `, [trainer1.id, trainer2.id]);

    console.log('');
    console.log('Demo trainers restored successfully.');

  } catch (error) {
    console.error('');
    console.error('ERROR:', error.message);
  } finally {
    await pool.end();
  }
}

restoreTrainers();