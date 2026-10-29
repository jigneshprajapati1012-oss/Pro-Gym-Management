import { Response } from 'express';
import pool from '../db/postgres';
import { AuthRequest } from '../middleware/authMiddleware';

export const getProgressHistory = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user!;
  const { member_id } = req.query;

  let sql = `
    SELECT
      fp.*,
      m.full_name AS member_name,
      u.name AS trainer_name
    FROM public.fitness_progress fp
    JOIN public.members m ON fp.member_id = m.id
    JOIN public.trainers t ON fp.trainer_id = t.id
    JOIN public.users u ON t.user_id = u.id
    WHERE 1=1
  `;

  const params: any[] = [];

  if (user.role === 'TRAINER') {
    if (!user.trainerId) {
      res.json({ progress: [] });
      return;
    }

    params.push(user.trainerId);
    sql += ` AND fp.trainer_id = $${params.length}`;
  }

  if (member_id) {
    params.push(member_id);
    sql += ` AND fp.member_id = $${params.length}`;
  }

  sql += `
    ORDER BY fp.record_date DESC, fp.id DESC
  `;

  try {
    const result = await pool.query(
      sql,
      params
    );

    res.json({
      progress: result.rows
    });

  } catch (error) {
    console.error('GET PROGRESS ERROR:', error);

    res.status(500).json({
      error: 'Unable to fetch fitness progress.'
    });
  }
};

export const addProgressRecord = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user!;

  const {
    member_id,
    record_date,
    weight_kg,
    height_cm,
    body_fat_pct,
    chest_in,
    waist_in,
    biceps_in,
    notes
  } = req.body;

  if (!member_id || !weight_kg || !height_cm) {
    res.status(400).json({
      error:
        'Member ID, weight (kg), and height (cm) are required.'
    });

    return;
  }

  const htM = Number(height_cm) / 100;

  const bmi = Number(
    (
      Number(weight_kg) /
      (htM * htM)
    ).toFixed(1)
  );

  const date =
    record_date ||
    new Date().toISOString().split('T')[0];

  const trainerId =
    user.role === 'TRAINER'
      ? user.trainerId
      : 1;

  if (!trainerId) {
    res.status(400).json({
      error: 'Trainer information is required.'
    });

    return;
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO public.fitness_progress (
          member_id,
          trainer_id,
          record_date,
          weight_kg,
          height_cm,
          bmi,
          body_fat_pct,
          chest_in,
          waist_in,
          biceps_in,
          notes
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11
        )
        RETURNING *
      `,
      [
        member_id,
        trainerId,
        date,
        Number(weight_kg),
        Number(height_cm),
        bmi,
        body_fat_pct
          ? Number(body_fat_pct)
          : null,
        chest_in
          ? Number(chest_in)
          : null,
        waist_in
          ? Number(waist_in)
          : null,
        biceps_in
          ? Number(biceps_in)
          : null,
        notes || null
      ]
    );

    res.status(201).json({
      message: 'Fitness progress entry added.',
      progressId: result.rows[0].id,
      bmi,
      progress: result.rows[0]
    });

  } catch (error) {
    console.error('ADD PROGRESS ERROR:', error);

    res.status(500).json({
      error: 'Unable to add fitness progress.'
    });
  }
};

export const deleteProgressRecord = async (
  req: AuthRequest,
  res: Response
) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      `
        DELETE FROM public.fitness_progress
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: 'Progress record not found.'
      });

      return;
    }

    res.json({
      message: 'Progress record deleted.'
    });

  } catch (error) {
    console.error('DELETE PROGRESS ERROR:', error);

    res.status(500).json({
      error: 'Unable to delete progress record.'
    });
  }
};