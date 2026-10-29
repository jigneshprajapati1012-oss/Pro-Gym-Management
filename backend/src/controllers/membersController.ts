import { Response } from 'express';
import pool from '../db/postgres';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * GET ALL MEMBERS
 */
export const getMembers = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user!;

  const {
    search,
    status,
    membership_type,
    trainer_id
  } = req.query;

  let sql = `
    SELECT
      m.*,
      t.id AS trainer_id,
      u.name AS trainer_name
    FROM members m
    LEFT JOIN trainers t
      ON m.assigned_trainer_id = t.id
    LEFT JOIN users u
      ON t.user_id = u.id
    WHERE 1 = 1
  `;

  const params: any[] = [];

  if (user.role === 'TRAINER') {
    if (!user.trainerId) {
      res.json({ members: [] });
      return;
    }

    sql += ` AND m.assigned_trainer_id = $${params.length + 1}`;
    params.push(user.trainerId);
  }

  if (user.role === 'OWNER' && trainer_id) {
    sql += ` AND m.assigned_trainer_id = $${params.length + 1}`;
    params.push(trainer_id);
  }

  if (search) {
    const searchText = `%${String(search)}%`;

    sql += `
      AND (
        m.member_code ILIKE $${params.length + 1}
        OR m.full_name ILIKE $${params.length + 2}
        OR m.phone ILIKE $${params.length + 3}
        OR m.email ILIKE $${params.length + 4}
      )
    `;

    params.push(
      searchText,
      searchText,
      searchText,
      searchText
    );
  }

  if (status) {
    sql += ` AND m.payment_status = $${params.length + 1}`;
    params.push(status);
  }

  if (membership_type) {
    sql += ` AND m.membership_type = $${params.length + 1}`;
    params.push(membership_type);
  }

  sql += ' ORDER BY m.id DESC';

  try {
    const result = await pool.query(sql, params);

    console.log('GET MEMBERS');
    console.log('PARAMS:', params);
    console.log('MEMBERS:', result.rows);

    res.json({
      members: result.rows
    });

  } catch (error) {
    console.error('Get members error:', error);

    res.status(500).json({
      error: 'Unable to fetch members.'
    });
  }
};


/**
 * GET MEMBER BY ID
 */
export const getMemberById = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user!;
  const memberId = req.params.id;

  try {
    const memberResult = await pool.query(
      `
        SELECT
          m.*,
          t.id AS trainer_id,
          u.name AS trainer_name
        FROM members m
        LEFT JOIN trainers t
          ON m.assigned_trainer_id = t.id
        LEFT JOIN users u
          ON t.user_id = u.id
        WHERE m.id = $1
      `,
      [memberId]
    );

    const member = memberResult.rows[0];

    if (!member) {
      res.status(404).json({
        error: 'Member not found.'
      });
      return;
    }

    if (
      user.role === 'TRAINER' &&
      member.assigned_trainer_id !== user.trainerId
    ) {
      res.status(403).json({
        error:
          'Access denied. This member is not assigned to you.'
      });
      return;
    }

    const attendanceResult = await pool.query(
      `
        SELECT *
        FROM attendance
        WHERE member_id = $1
        ORDER BY date DESC
        LIMIT 10
      `,
      [memberId]
    );

    let payments: any[] = [];

    if (user.role === 'OWNER') {
      const paymentResult = await pool.query(
        `
          SELECT *
          FROM payments
          WHERE member_id = $1
          ORDER BY payment_date DESC
        `,
        [memberId]
      );

      payments = paymentResult.rows;
    }

    const progressResult = await pool.query(
      `
        SELECT *
        FROM fitness_progress
        WHERE member_id = $1
        ORDER BY record_date DESC
      `,
      [memberId]
    );

    res.json({
      member,
      attendance: attendanceResult.rows,
      payments,
      progress: progressResult.rows
    });

  } catch (error) {
    console.error('Get member by ID error:', error);

    res.status(500).json({
      error: 'Unable to fetch member record.'
    });
  }
};


/**
 * CREATE MEMBER
 */
export const createMember = async (
  req: AuthRequest,
  res: Response
) => {
  const {
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
    notes,
    initial_payment_amount,
    payment_method
  } = req.body;

  if (
    !full_name ||
    !phone ||
    !membership_type ||
    !start_date ||
    !expiry_date
  ) {
    res.status(400).json({
      error:
        'Full name, phone, membership type, start date, and expiry date are required.'
    });

    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (assigned_trainer_id) {
      const trainerResult = await client.query(
        'SELECT id FROM trainers WHERE id = $1',
        [assigned_trainer_id]
      );

      if (trainerResult.rows.length === 0) {
        await client.query('ROLLBACK');

        res.status(400).json({
          error: 'Selected trainer does not exist.'
        });

        return;
      }
    }

    const registrationDate =
      registration_date ||
      new Date().toISOString().split('T')[0];

    /*
     * Find the highest existing member number.
     * New members start from M101.
     */
    const lastMemberResult = await client.query(
      `
        SELECT member_code
        FROM members
        WHERE member_code IS NOT NULL
          AND member_code LIKE 'M%'
        ORDER BY CAST(
          SUBSTRING(member_code FROM 2) AS INTEGER
        ) DESC
        LIMIT 1
      `
    );

    let nextNumber = 101;

    const lastMember = lastMemberResult.rows[0];

    if (lastMember?.member_code) {
      const lastNumber = parseInt(
        String(lastMember.member_code).substring(1),
        10
      );

      if (!isNaN(lastNumber)) {
        nextNumber = Math.max(
          101,
          lastNumber + 1
        );
      }
    }

    const memberCode = `M${nextNumber}`;

    const memberResult = await client.query(
      `
        INSERT INTO members (
          member_code,
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
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14, $15, $16
        )
        RETURNING id
      `,
      [
        memberCode,
        full_name.trim(),
        photo_url || null,
        dob || null,
        gender || 'Male',
        phone.trim(),
        email?.trim() || null,
        address?.trim() || null,
        emergency_contact?.trim() || null,
        membership_type,
        start_date,
        expiry_date,
        payment_status || 'Paid',
        assigned_trainer_id || null,
        registrationDate,
        notes?.trim() || null
      ]
    );

    const memberId = memberResult.rows[0].id;

    const paymentAmount =
      Number(initial_payment_amount || 0);

    if (paymentAmount > 0) {
      const transactionId =
        `SFW-TXN-${Date.now()}`;

      await client.query(
        `
          INSERT INTO payments (
            member_id,
            amount,
            payment_date,
            payment_method,
            membership_plan,
            status,
            transaction_id,
            notes
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          memberId,
          paymentAmount,
          start_date,
          payment_method || 'Cash',
          membership_type,
          payment_status === 'Pending'
            ? 'Pending'
            : 'Completed',
          transactionId,
          'Initial membership registration payment'
        ]
      );
    }

    await client.query(
      `
        INSERT INTO notifications (
          title,
          message,
          type,
          recipient_role
        )
        VALUES ($1, $2, $3, $4)
      `,
      [
        'New Member Registered',
        `Member ${full_name} (${memberCode}) registered on the ${membership_type} plan.`,
        'system',
        'OWNER'
      ]
    );

    await client.query('COMMIT');

    console.log(
      'NEW MEMBER:',
      memberId,
      memberCode
    );

    res.status(201).json({
      message: 'Member created successfully.',
      memberId,
      memberCode
    });

  } catch (error) {
    await client.query('ROLLBACK');

    console.error(
      'CREATE MEMBER ERROR:',
      error
    );

    res.status(500).json({
      error: 'Unable to create member record.'
    });

  } finally {
    client.release();
  }
};


/**
 * UPDATE MEMBER
 */
export const updateMember = async (
  req: AuthRequest,
  res: Response
) => {
  const memberId = req.params.id;

  const {
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
    notes
  } = req.body;

  try {
    const memberResult = await pool.query(
      'SELECT id FROM members WHERE id = $1',
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      res.status(404).json({
        error: 'Member not found.'
      });
      return;
    }

    if (assigned_trainer_id) {
      const trainerResult = await pool.query(
        'SELECT id FROM trainers WHERE id = $1',
        [assigned_trainer_id]
      );

      if (trainerResult.rows.length === 0) {
        res.status(400).json({
          error: 'Selected trainer does not exist.'
        });
        return;
      }
    }

    await pool.query(
      `
        UPDATE members
        SET
          full_name = $1,
          photo_url = $2,
          dob = $3,
          gender = $4,
          phone = $5,
          email = $6,
          address = $7,
          emergency_contact = $8,
          membership_type = $9,
          start_date = $10,
          expiry_date = $11,
          payment_status = $12,
          assigned_trainer_id = $13,
          notes = $14
        WHERE id = $15
      `,
      [
        full_name,
        photo_url || null,
        dob || null,
        gender || 'Male',
        phone,
        email || null,
        address || null,
        emergency_contact || null,
        membership_type,
        start_date,
        expiry_date,
        payment_status,
        assigned_trainer_id || null,
        notes || null,
        memberId
      ]
    );

    console.log(
      'MEMBER UPDATED:',
      memberId
    );

    res.json({
      message: 'Member updated successfully.'
    });

  } catch (error) {
    console.error(
      'Update member error:',
      error
    );

    res.status(500).json({
      error: 'Unable to update member record.'
    });
  }
};


/**
 * DELETE MEMBER
 */
export const deleteMember = async (
  req: AuthRequest,
  res: Response
) => {
  const memberId = req.params.id;

  try {
    const memberResult = await pool.query(
      `
        SELECT id, full_name
        FROM members
        WHERE id = $1
      `,
      [memberId]
    );

    const member = memberResult.rows[0];

    if (!member) {
      res.status(404).json({
        error: 'Member not found.'
      });
      return;
    }

    await pool.query(
      'DELETE FROM members WHERE id = $1',
      [memberId]
    );

    console.log(
      'MEMBER DELETED:',
      memberId,
      member.full_name
    );

    res.json({
      message:
        `Member ${member.full_name} deleted successfully.`
    });

  } catch (error) {
    console.error(
      'Delete member error:',
      error
    );

    res.status(500).json({
      error: 'Unable to delete member record.'
    });
  }
};