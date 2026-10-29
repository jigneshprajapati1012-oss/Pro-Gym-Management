import { Response } from 'express';
import bcrypt from 'bcryptjs';

import pool from '../db/postgres';
import { AuthRequest } from '../middleware/authMiddleware';

export const getTrainers = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { search, status } = req.query;

    let sql = `
      SELECT
        t.*,
        u.name,
        u.email,
        (
          SELECT COUNT(*)
          FROM members m
          WHERE m.assigned_trainer_id = t.id
        ) AS assigned_members_count
      FROM trainers t
      JOIN users u ON t.user_id = u.id
      WHERE 1 = 1
    `;

    const params: any[] = [];

    if (search) {
      sql += `
        AND (
          u.name ILIKE $1
          OR u.email ILIKE $1
          OR t.specialization ILIKE $1
        )
      `;

      params.push(`%${String(search)}%`);
    }

    if (status) {
      params.push(status);
      sql += ` AND t.status = $${params.length}`;
    }

    sql += ' ORDER BY t.id DESC';

    const result =
      await pool.query(sql, params);

    res.json({
      trainers: result.rows
    });
  } catch (error) {
    console.error(
      'Get trainers error:',
      error
    );

    res.status(500).json({
      error: 'Unable to fetch trainers.'
    });
  }
};

export const getTrainerById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.params.id;

    const trainerResult =
      await pool.query(
        `
        SELECT
          t.*,
          u.name,
          u.email
        FROM trainers t
        JOIN users u
          ON t.user_id = u.id
        WHERE t.id = $1
        `,
        [id]
      );

    const trainer =
      trainerResult.rows[0];

    if (!trainer) {
      res.status(404).json({
        error: 'Trainer not found.'
      });
      return;
    }

    const membersResult =
      await pool.query(
        `
        SELECT
          id,
          full_name,
          phone,
          membership_type,
          expiry_date,
          payment_status
        FROM members
        WHERE assigned_trainer_id = $1
        `,
        [id]
      );

    res.json({
      trainer,
      assignedMembers:
        membersResult.rows
    });
  } catch (error) {
    console.error(
      'Get trainer error:',
      error
    );

    res.status(500).json({
      error: 'Unable to fetch trainer.'
    });
  }
};

export const createTrainer = async (
  req: AuthRequest,
  res: Response
) => {
  const {
    name,
    email,
    password,
    phone,
    specialization,
    experience_years,
    joining_date,
    status,
    bio,
    photo_url
  } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({
      error:
        'Trainer name, email, and password are required.'
    });
    return;
  }

  const client = await pool.connect();

  try {
    const cleanEmail =
      email.toLowerCase().trim();

    await client.query('BEGIN');

    const existingUser =
      await client.query(
        `
        SELECT id
        FROM users
        WHERE email = $1
        `,
        [cleanEmail]
      );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');

      res.status(400).json({
        error:
          'User with this email already exists.'
      });
      return;
    }

    const passwordHash =
      bcrypt.hashSync(
        password,
        10
      );

    const userResult =
      await client.query(
        `
        INSERT INTO users (
          email,
          password_hash,
          role,
          name
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [
          cleanEmail,
          passwordHash,
          'TRAINER',
          name
        ]
      );

    const userId =
      userResult.rows[0].id;

    const trainerResult =
      await client.query(
        `
        INSERT INTO trainers (
          user_id,
          phone,
          specialization,
          experience_years,
          joining_date,
          status,
          bio,
          photo_url
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8
        )
        RETURNING id
        `,
        [
          userId,
          phone || null,
          specialization ||
            'Fitness Trainer',
          Number(experience_years) || 1,
          joining_date ||
            new Date()
              .toISOString()
              .split('T')[0],
          status || 'Active',
          bio || null,
          photo_url || null
        ]
      );

    await client.query('COMMIT');

    res.status(201).json({
      message:
        'Trainer account created successfully',
      trainerId:
        trainerResult.rows[0].id
    });
  } catch (error) {
    await client.query('ROLLBACK');

    console.error(
      'Create trainer error:',
      error
    );

    res.status(500).json({
      error:
        'Unable to create trainer account.'
    });
  } finally {
    client.release();
  }
};

export const updateTrainer = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.params.id;

    const {
      name,
      phone,
      specialization,
      experience_years,
      joining_date,
      status,
      bio,
      photo_url
    } = req.body;

    const trainerResult =
      await pool.query(
        `
        SELECT user_id
        FROM trainers
        WHERE id = $1
        `,
        [id]
      );

    const trainer =
      trainerResult.rows[0];

    if (!trainer) {
      res.status(404).json({
        error: 'Trainer not found.'
      });
      return;
    }

    if (name) {
      await pool.query(
        `
        UPDATE users
        SET name = $1
        WHERE id = $2
        `,
        [
          name,
          trainer.user_id
        ]
      );
    }

    await pool.query(
      `
      UPDATE trainers
      SET
        phone = $1,
        specialization = $2,
        experience_years = $3,
        joining_date = $4,
        status = $5,
        bio = $6,
        photo_url = $7
      WHERE id = $8
      `,
      [
        phone || null,
        specialization ||
          'Fitness Trainer',
        Number(experience_years) || 1,
        joining_date || null,
        status || 'Active',
        bio || null,
        photo_url || null,
        id
      ]
    );

    res.json({
      message:
        'Trainer updated successfully.'
    });
  } catch (error) {
    console.error(
      'Update trainer error:',
      error
    );

    res.status(500).json({
      error:
        'Unable to update trainer.'
    });
  }
};

export const assignMembersToTrainer =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    const trainerId =
      req.params.id;

    const { memberIds } =
      req.body;

    if (!Array.isArray(memberIds)) {
      res.status(400).json({
        error:
          'memberIds must be an array.'
      });
      return;
    }

    const client =
      await pool.connect();

    try {
      await client.query('BEGIN');

      for (const memberId of memberIds) {
        await client.query(
          `
          UPDATE members
          SET assigned_trainer_id = $1
          WHERE id = $2
          `,
          [
            trainerId,
            memberId
          ]
        );
      }

      await client.query('COMMIT');

      res.json({
        message:
          `Assigned ${memberIds.length} members to trainer.`
      });
    } catch (error) {
      await client.query('ROLLBACK');

      console.error(
        'Assign members error:',
        error
      );

      res.status(500).json({
        error:
          'Unable to assign members to trainer.'
      });
    } finally {
      client.release();
    }
  };

export const deleteTrainer = async (
  req: AuthRequest,
  res: Response
) => {
  const id = req.params.id;

  const client =
    await pool.connect();

  try {
    await client.query('BEGIN');

    const trainerResult =
      await client.query(
        `
        SELECT user_id
        FROM trainers
        WHERE id = $1
        `,
        [id]
      );

    const trainer =
      trainerResult.rows[0];

    if (!trainer) {
      await client.query('ROLLBACK');

      res.status(404).json({
        error: 'Trainer not found.'
      });
      return;
    }

    await client.query(
      `
      UPDATE members
      SET assigned_trainer_id = NULL
      WHERE assigned_trainer_id = $1
      `,
      [id]
    );

    await client.query(
      `
      DELETE FROM users
      WHERE id = $1
      `,
      [trainer.user_id]
    );

    await client.query('COMMIT');

    res.json({
      message:
        'Trainer deleted successfully.'
    });
  } catch (error) {
    await client.query('ROLLBACK');

    console.error(
      'Delete trainer error:',
      error
    );

    res.status(500).json({
      error:
        'Unable to delete trainer.'
    });
  } finally {
    client.release();
  }
};