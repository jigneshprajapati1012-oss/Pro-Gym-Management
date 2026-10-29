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

async function addMemberCode() {
  try {
    console.log('Adding member_code to members table...');

    await pool.query(`
      ALTER TABLE public.members
      ADD COLUMN IF NOT EXISTS member_code TEXT
    `);

    console.log('member_code column is ready.');

    const members = await pool.query(`
      SELECT id
      FROM public.members
      WHERE member_code IS NULL
         OR member_code = ''
      ORDER BY id
    `);

    let nextNumber = 101;

    for (const member of members.rows) {
      await pool.query(`
        UPDATE public.members
        SET member_code = $1
        WHERE id = $2
      `, [
        `M${nextNumber}`,
        member.id
      ]);

      nextNumber++;
    }

    console.log(`Assigned member codes to ${members.rows.length} member(s).`);

    const result = await pool.query(`
      SELECT id, member_code, full_name
      FROM public.members
      ORDER BY id
    `);

    console.table(result.rows);

  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await pool.end();
  }
}

addMemberCode();