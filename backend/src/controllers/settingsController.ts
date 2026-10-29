import { Response } from 'express';
import pool from '../db/postgres';
import { AuthRequest } from '../middleware/authMiddleware';

export const getSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const result = await pool.query(`
      SELECT key, value
      FROM public.gym_settings
    `);

    const settingsMap: Record<string, string> = {};

    result.rows.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });

    res.json({
      settings: settingsMap
    });

  } catch (error) {
    console.error('GET SETTINGS ERROR:', error);

    res.status(500).json({
      error: 'Unable to fetch gym settings.'
    });
  }
};

export const updateSettings = async (
  req: AuthRequest,
  res: Response
) => {
  const settingsObj = req.body;

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const [key, value] of Object.entries(settingsObj)) {
        await client.query(
          `
            INSERT INTO public.gym_settings (key, value)
            VALUES ($1, $2)
            ON CONFLICT (key)
            DO UPDATE SET value = EXCLUDED.value
          `,
          [key, String(value)]
        );
      }

      await client.query('COMMIT');

      res.json({
        message: 'Gym settings saved successfully.'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('UPDATE SETTINGS ERROR:', error);

    res.status(500).json({
      error: 'Unable to save gym settings.'
    });
  }
};