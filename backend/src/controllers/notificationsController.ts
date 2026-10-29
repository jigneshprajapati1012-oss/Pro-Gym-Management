import { Response } from 'express';
import pool from '../db/postgres';
import { AuthRequest } from '../middleware/authMiddleware';

export const getNotifications = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user!;

  try {
    const notificationsResult = await pool.query(
      `
        SELECT *
        FROM public.notifications
        WHERE recipient_role = 'ALL'
           OR recipient_role = $1
        ORDER BY created_at DESC
        LIMIT 20
      `,
      [user.role]
    );

    const unreadResult = await pool.query(
      `
        SELECT COUNT(*) AS count
        FROM public.notifications
        WHERE (
          recipient_role = 'ALL'
          OR recipient_role = $1
        )
        AND is_read = 0
      `,
      [user.role]
    );

    res.json({
      notifications: notificationsResult.rows,
      unreadCount: Number(unreadResult.rows[0]?.count || 0)
    });

  } catch (error) {
    console.error('GET NOTIFICATIONS ERROR:', error);

    res.status(500).json({
      error: 'Unable to fetch notifications.'
    });
  }
};

export const markNotificationRead = async (
  req: AuthRequest,
  res: Response
) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      `
        UPDATE public.notifications
        SET is_read = 1
        WHERE id = $1
        RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: 'Notification not found.'
      });

      return;
    }

    res.json({
      message: 'Notification marked as read.'
    });

  } catch (error) {
    console.error('MARK NOTIFICATION READ ERROR:', error);

    res.status(500).json({
      error: 'Unable to mark notification as read.'
    });
  }
};

export const markAllNotificationsRead = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user!;

  try {
    await pool.query(
      `
        UPDATE public.notifications
        SET is_read = 1
        WHERE recipient_role = 'ALL'
           OR recipient_role = $1
      `,
      [user.role]
    );

    res.json({
      message: 'All notifications marked as read.'
    });

  } catch (error) {
    console.error('MARK ALL NOTIFICATIONS READ ERROR:', error);

    res.status(500).json({
      error: 'Unable to mark all notifications as read.'
    });
  }
};