import { Response } from 'express';
import pool from '../db/postgres';
import { AuthRequest } from '../middleware/authMiddleware';

export const getPayments = async (
  req: AuthRequest,
  res: Response
) => {
  const {
    search,
    status,
    payment_method,
    start_date,
    end_date
  } = req.query;

  let sql = `
    SELECT
      p.*,
      m.full_name AS member_name,
      m.email AS member_email,
      m.phone AS member_phone
    FROM public.payments p
    JOIN public.members m ON p.member_id = m.id
    WHERE 1=1
  `;

  const params: any[] = [];

  if (search) {
    const term = `%${search}%`;
    params.push(term);

    sql += `
      AND (
        m.full_name ILIKE $${params.length}
        OR p.transaction_id ILIKE $${params.length}
        OR m.phone ILIKE $${params.length}
      )
    `;
  }

  if (status) {
    params.push(status);
    sql += ` AND p.status = $${params.length}`;
  }

  if (payment_method) {
    params.push(payment_method);
    sql += ` AND p.payment_method = $${params.length}`;
  }

  if (start_date) {
    params.push(start_date);
    sql += ` AND p.payment_date >= $${params.length}`;
  }

  if (end_date) {
    params.push(end_date);
    sql += ` AND p.payment_date <= $${params.length}`;
  }

  sql += `
    ORDER BY p.payment_date DESC, p.id DESC
  `;

  try {
    const paymentsResult = await pool.query(
      sql,
      params
    );

    const revenueResult = await pool.query(`
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN status = 'Completed' THEN amount
              ELSE 0
            END
          ),
          0
        ) AS total_revenue,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'Pending' THEN amount
              ELSE 0
            END
          ),
          0
        ) AS pending_amount

      FROM public.payments
    `);

    res.json({
      payments: paymentsResult.rows,
      summary: {
        totalRevenue: Number(
          revenueResult.rows[0]?.total_revenue || 0
        ),
        pendingAmount: Number(
          revenueResult.rows[0]?.pending_amount || 0
        )
      }
    });

  } catch (error) {
    console.error('GET PAYMENTS ERROR:', error);

    res.status(500).json({
      error: 'Unable to fetch payments.'
    });
  }
};

export const getReceipt = async (
  req: AuthRequest,
  res: Response
) => {
  const id = req.params.id;

  try {
    const paymentResult = await pool.query(
      `
        SELECT
          p.*,
          m.full_name AS member_name,
          m.phone AS member_phone,
          m.email AS member_email,
          m.address AS member_address
        FROM public.payments p
        JOIN public.members m ON p.member_id = m.id
        WHERE p.id = $1
      `,
      [id]
    );

    if (paymentResult.rows.length === 0) {
      res.status(404).json({
        error: 'Payment record not found.'
      });

      return;
    }

    const settingsResult = await pool.query(`
      SELECT key, value
      FROM public.gym_settings
    `);

    const settingsMap: Record<string, string> = {};

    settingsResult.rows.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });

    res.json({
      payment: paymentResult.rows[0],
      gymSettings: settingsMap
    });

  } catch (error) {
    console.error('GET RECEIPT ERROR:', error);

    res.status(500).json({
      error: 'Unable to fetch payment receipt.'
    });
  }
};

export const createPayment = async (
  req: AuthRequest,
  res: Response
) => {
  const {
    member_id,
    amount,
    payment_date,
    payment_method,
    membership_plan,
    status,
    transaction_id,
    notes,
    update_member_status
  } = req.body;

  if (
    !member_id ||
    !amount ||
    !payment_method ||
    !membership_plan
  ) {
    res.status(400).json({
      error:
        'Member ID, amount, payment method, and membership plan are required.'
    });

    return;
  }

  const txn =
    transaction_id ||
    `TXN-SFW-${Date.now().toString().slice(-6)}`;

  const date =
    payment_date ||
    new Date().toISOString().split('T')[0];

  const pStatus = status || 'Completed';

  try {
    const result = await pool.query(
      `
        INSERT INTO public.payments (
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
        RETURNING *
      `,
      [
        member_id,
        Number(amount),
        date,
        payment_method,
        membership_plan,
        pStatus,
        txn,
        notes || null
      ]
    );

    if (update_member_status || pStatus === 'Completed') {
      await pool.query(
        `
          UPDATE public.members
          SET payment_status = $1
          WHERE id = $2
        `,
        [
          pStatus === 'Completed'
            ? 'Paid'
            : 'Pending',
          member_id
        ]
      );
    }

    res.status(201).json({
      message: 'Payment recorded successfully',
      paymentId: result.rows[0].id,
      transactionId: txn,
      payment: result.rows[0]
    });

  } catch (error) {
    console.error('CREATE PAYMENT ERROR:', error);

    res.status(500).json({
      error: 'Unable to record payment.'
    });
  }
};

export const updatePayment = async (
  req: AuthRequest,
  res: Response
) => {
  const id = req.params.id;

  const {
    amount,
    payment_date,
    payment_method,
    membership_plan,
    status,
    notes
  } = req.body;

  try {
    const result = await pool.query(
      `
        UPDATE public.payments
        SET
          amount = $1,
          payment_date = $2,
          payment_method = $3,
          membership_plan = $4,
          status = $5,
          notes = $6
        WHERE id = $7
        RETURNING *
      `,
      [
        Number(amount),
        payment_date,
        payment_method,
        membership_plan,
        status,
        notes || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: 'Payment record not found.'
      });

      return;
    }

    res.json({
      message: 'Payment updated successfully.',
      payment: result.rows[0]
    });

  } catch (error) {
    console.error('UPDATE PAYMENT ERROR:', error);

    res.status(500).json({
      error: 'Unable to update payment.'
    });
  }
};

export const deletePayment = async (
  req: AuthRequest,
  res: Response
) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      `
        DELETE FROM public.payments
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: 'Payment record not found.'
      });

      return;
    }

    res.json({
      message: 'Payment record deleted.'
    });

  } catch (error) {
    console.error('DELETE PAYMENT ERROR:', error);

    res.status(500).json({
      error: 'Unable to delete payment.'
    });
  }
};