import { Response } from 'express';
import pool from '../db/postgres';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendEmail } from '../services/emailService';

export const createQuery = async (
  req: any,
  res: Response
) => {
  const {
    name,
    email,
    phone,
    subject,
    message
  } = req.body;

  if (!name || !email || !phone || !subject) {
    res.status(400).json({
      error: 'Name, email, phone and subject are required.'
    });

    return;
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO public.queries (
          name,
          email,
          phone,
          subject,
          message
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [
        name.trim(),
        email.trim(),
        phone.trim(),
        subject,
        message?.trim() || null
      ]
    );

    res.status(201).json({
      message: 'Inquiry submitted successfully.',
      query: result.rows[0]
    });

  } catch (error) {
    console.error('CREATE QUERY ERROR:', error);

    res.status(500).json({
      error: 'Unable to submit inquiry.'
    });
  }
};


export const getQueries = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user!;

  if (user.role !== 'OWNER') {
    res.status(403).json({
      error: 'Only the gym owner can view user queries.'
    });

    return;
  }

  try {
    const result = await pool.query(
      `
        SELECT *
        FROM public.queries
        ORDER BY created_at DESC
      `
    );

    res.json({
      queries: result.rows
    });

  } catch (error) {
    console.error('GET QUERIES ERROR:', error);

    res.status(500).json({
      error: 'Unable to fetch queries.'
    });
  }
};


export const updateQueryStatus = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user!;

  if (user.role !== 'OWNER') {
    res.status(403).json({
      error: 'Only the gym owner can update queries.'
    });

    return;
  }

  const queryId = req.params.id;
  const { status } = req.body;

  const allowedStatuses = [
    'New',
    'Read',
    'Replied',
    'Closed'
  ];

  if (!allowedStatuses.includes(status)) {
    res.status(400).json({
      error: 'Invalid query status.'
    });

    return;
  }

  try {
    const result = await pool.query(
      `
        UPDATE public.queries
        SET
          status = $1,
          replied_at =
            CASE
              WHEN $1 = 'Replied' THEN NOW()
              ELSE replied_at
            END
        WHERE id = $2
        RETURNING *
      `,
      [status, queryId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: 'Query not found.'
      });

      return;
    }

    res.json({
      message: 'Query status updated.',
      query: result.rows[0]
    });

  } catch (error) {
    console.error('UPDATE QUERY ERROR:', error);

    res.status(500).json({
      error: 'Unable to update query.'
    });
  }
};


export const deleteQuery = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user!;

  if (user.role !== 'OWNER') {
    res.status(403).json({
      error: 'Only the gym owner can delete queries.'
    });

    return;
  }

  const queryId = req.params.id;

  try {
    const result = await pool.query(
      `
        DELETE FROM public.queries
        WHERE id = $1
        RETURNING id
      `,
      [queryId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: 'Query not found.'
      });

      return;
    }

    res.json({
      message: 'Query deleted successfully.'
    });

  } catch (error) {
    console.error('DELETE QUERY ERROR:', error);

    res.status(500).json({
      error: 'Unable to delete query.'
    });
  }
};


export const replyToQuery = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user!;

  if (user.role !== 'OWNER') {
    res.status(403).json({
      error: 'Only the gym owner can reply to queries.'
    });

    return;
  }

  const queryId = req.params.id;
  const { message } = req.body;

  if (!message || !message.trim()) {
    res.status(400).json({
      error: 'Reply message is required.'
    });

    return;
  }

  try {
    const result = await pool.query(
      `
        SELECT *
        FROM public.queries
        WHERE id = $1
      `,
      [queryId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: 'Query not found.'
      });

      return;
    }

    const query = result.rows[0];

    await sendEmail(
      query.email,
      `Re: ${query.subject}`,
      message.trim()
    );

    const updatedQuery = await pool.query(
      `
        UPDATE public.queries
        SET
          status = 'Replied',
          replied_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [queryId]
    );

    res.json({
      message: 'Reply sent successfully.',
      query: updatedQuery.rows[0]
    });

  } catch (error) {
    console.error('REPLY QUERY ERROR:', error);

    res.status(500).json({
      error: 'Unable to send reply.'
    });
  }
};