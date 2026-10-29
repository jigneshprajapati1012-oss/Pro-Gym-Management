import {
  Request,
  Response,
  NextFunction
} from 'express';

import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config/jwt';
import pool from '../db/postgres';

export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: 'OWNER' | 'TRAINER';
  name: string;
  trainerId?: number;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

interface UserRecord {
  id: number;
  email: string;
  role: 'OWNER' | 'TRAINER';
  name: string;
}

interface TrainerRecord {
  id: number;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({
      error: 'Authentication required. No token provided.'
    });
    return;
  }

  if (!authorization.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Invalid authorization format.'
    });
    return;
  }

  const token = authorization.substring(7);

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as AuthenticatedUser;

    const userResult = await pool.query(
      `
      SELECT id, email, role, name
      FROM users
      WHERE id = $1
      `,
      [decoded.userId]
    );

    const user = userResult.rows[0] as UserRecord | undefined;

    if (!user) {
      res.status(401).json({
        error: 'User account no longer exists.'
      });
      return;
    }

    let trainerId: number | undefined;

    if (user.role === 'TRAINER') {
      const trainerResult = await pool.query(
        `
        SELECT id
        FROM trainers
        WHERE user_id = $1
        `,
        [user.id]
      );

      const trainer =
        trainerResult.rows[0] as TrainerRecord | undefined;

      if (trainer) {
        trainerId = trainer.id;
      }
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      trainerId
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    res.status(401).json({
      error: 'Invalid or expired authentication token.'
    });
  }
};