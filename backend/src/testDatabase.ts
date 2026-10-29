import pool from './db/postgres';

const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');

    console.log('====================================');
    console.log('SUPABASE DATABASE CONNECTED');
    console.log('Database time:', result.rows[0].now);
    console.log('====================================');

    await pool.end();
  } catch (error) {
    console.error('====================================');
    console.error('SUPABASE DATABASE CONNECTION FAILED');
    console.error(error);
    console.error('====================================');

    process.exit(1);
  }
};

testConnection();