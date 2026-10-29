import { Response } from 'express';
import pool from '../db/postgres';
import { AuthRequest } from '../middleware/authMiddleware';


export const getAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user!;

  const {
    date,
    member_id,
    member_code,
    status
  } = req.query;

  let sql = `
    SELECT
      a.*,
      m.member_code,
      m.full_name AS member_name,
      m.phone,
      m.membership_type,
      u.name AS marked_by_name
    FROM public.attendance a
    JOIN public.members m
      ON a.member_id = m.id
    LEFT JOIN public.users u
      ON a.marked_by_user_id = u.id
    WHERE 1 = 1
  `;

  const params: any[] = [];

  if (user.role === 'TRAINER') {
    if (!user.trainerId) {
      res.json({ attendance: [] });
      return;
    }

    sql += `
      AND m.assigned_trainer_id = $${params.length + 1}
    `;

    params.push(user.trainerId);
  }

  if (date) {
    sql += `
      AND a.date = $${params.length + 1}
    `;

    params.push(String(date));
  }

  if (member_id) {
    sql += `
      AND a.member_id = $${params.length + 1}
    `;

    params.push(Number(member_id));
  }

  if (member_code) {
    sql += `
      AND m.member_code = $${params.length + 1}
    `;

    params.push(
      String(member_code).trim().toUpperCase()
    );
  }

  if (status) {
    sql += `
      AND a.status = $${params.length + 1}
    `;

    params.push(String(status));
  }

  sql += `
    ORDER BY a.date DESC, a.id DESC
  `;

  try {
    const result = await pool.query(
      sql,
      params
    );

    res.json({
      attendance: result.rows
    });

  } catch (error) {
    console.error(
      'Get attendance error:',
      error
    );

    res.status(500).json({
      error:
        'Unable to fetch attendance records.'
    });
  }
};


export const markAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user!;

  const {
    member_id,
    member_code,
    date,
    check_in_time,
    status
  } = req.body;

  if ((!member_id && !member_code) || !date) {
    res.status(400).json({
      error:
        'Member ID and date are required.'
    });

    return;
  }

  let member: any;

  /*
   * If the frontend sends M101,
   * find the internal database ID.
   */
  if (member_code) {
    const code = String(
      member_code
    ).trim().toUpperCase();

    const memberResult = await pool.query(`
      SELECT
        id,
        member_code,
        full_name,
        assigned_trainer_id
      FROM public.members
      WHERE member_code = $1
    `, [code]);

    member = memberResult.rows[0];

  } else {
    const memberResult = await pool.query(`
      SELECT
        id,
        member_code,
        full_name,
        assigned_trainer_id
      FROM public.members
      WHERE id = $1
    `, [Number(member_id)]);

    member = memberResult.rows[0];
  }

  if (!member) {
    res.status(404).json({
      error: 'Member ID not found.'
    });

    return;
  }

  if (
    user.role === 'TRAINER' &&
    member.assigned_trainer_id !== user.trainerId
  ) {
    res.status(403).json({
      error:
        'Access Denied: Member is not assigned to you.'
    });

    return;
  }

  const time =
    check_in_time ||
    new Date().toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  const attStatus =
    status || 'Present';

  /*
   * One attendance record per member per date.
   */
  const existingResult = await pool.query(`
    SELECT id
    FROM public.attendance
    WHERE member_id = $1
      AND date = $2
  `, [
    member.id,
    date
  ]);

  const existing = existingResult.rows[0];

  if (existing) {
    await pool.query(`
      UPDATE public.attendance
      SET
        status = $1,
        check_in_time = $2,
        marked_by_user_id = $3
      WHERE id = $4
    `, [
      attStatus,
      time,
      user.userId,
      existing.id
    ]);

    res.json({
      message:
        `Attendance updated for ${member.member_code} - ${member.full_name}.`,
      attendanceId: existing.id
    });

    return;
  }

  const result = await pool.query(`
    INSERT INTO public.attendance (
      member_id,
      date,
      check_in_time,
      status,
      marked_by_user_id
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [
    member.id,
    date,
    time,
    attStatus,
    user.userId
  ]);

  res.status(201).json({
    message:
      `Attendance marked for ${member.member_code} - ${member.full_name}.`,
    attendanceId: result.rows[0].id
  });
};


export const deleteAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  const id = req.params.id;

  try {
    await pool.query(
      'DELETE FROM public.attendance WHERE id = $1',
      [Number(id)]
    );

    res.json({
      message:
        'Attendance record deleted.'
    });

  } catch (error) {
    console.error(
      'Delete attendance error:',
      error
    );

    res.status(500).json({
      error:
        'Unable to delete attendance record.'
    });
  }
};