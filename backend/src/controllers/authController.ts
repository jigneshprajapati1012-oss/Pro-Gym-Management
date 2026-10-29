import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import  pool  from '../db/postgres';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt';
import { AuthRequest } from '../middleware/authMiddleware';

type PasswordResetRequest = {
  userId: number;
  expiresAt: number;
};

const passwordResetTokens = new Map<string, PasswordResetRequest>();

export const login = async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      res.status(400).json({
        error: 'Email and password are required.'
      });
      return;
    }

    const result = await pool.query(
      `
      SELECT id, email, password_hash, role, name
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        error: 'Invalid email or password.'
      });
      return;
    }

    const user = result.rows[0];

    const passwordMatches = bcrypt.compareSync(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      res.status(401).json({
        error: 'Invalid email or password.'
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

      if (trainerResult.rows.length > 0) {
        trainerId = trainerResult.rows[0].id;
      }
    }

    const userData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      trainerId
    };

    const token = jwt.sign(
      userData,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        trainerId
      }
    });
  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      error: 'Unable to process login request.'
    });
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Not authenticated'
      });
      return;
    }

    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get me error:', error);

    res.status(500).json({
      error: 'Unable to get user information.'
    });
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        error: 'Current password and new password are required.'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        error: 'New password must be at least 6 characters long.'
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        error: 'Not authenticated.'
      });
      return;
    }

    const result = await pool.query(
      `
      SELECT id, password_hash
      FROM users
      WHERE id = $1
      `,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: 'User account not found.'
      });
      return;
    }

    const user = result.rows[0];

    const passwordMatches = bcrypt.compareSync(
      currentPassword,
      user.password_hash
    );

    if (!passwordMatches) {
      res.status(400).json({
        error: 'Incorrect current password.'
      });
      return;
    }

    const newPasswordHash = bcrypt.hashSync(
      newPassword,
      10
    );

    await pool.query(
      `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      `,
      [newPasswordHash, req.user.userId]
    );

    res.json({
      message: 'Password updated successfully.'
    });
  } catch (error) {
    console.error('Change password error:', error);

    res.status(500).json({
      error: 'Unable to change password.'
    });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const email = String(
      req.body.email || ''
    ).trim().toLowerCase();

    if (!email) {
      res.status(400).json({
        error: 'Email is required.'
      });
      return;
    }

    const result = await pool.query(
      `
      SELECT id, email
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        error: 'No staff account was found with this email.'
      });
      return;
    }

    const user = result.rows[0];

    const resetToken = crypto
      .randomBytes(32)
      .toString('hex');

    passwordResetTokens.set(resetToken, {
      userId: user.id,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    res.json({
      message: 'Email verified. You can now create a new password.',
      resetToken
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    res.status(500).json({
      error: 'Unable to process password reset request.'
    });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const resetToken = String(
      req.body.resetToken || ''
    );

    const newPassword = String(
      req.body.newPassword || ''
    );

    if (!resetToken || !newPassword) {
      res.status(400).json({
        error: 'Reset token and new password are required.'
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        error: 'New password must be at least 6 characters long.'
      });
      return;
    }

    const resetRequest =
      passwordResetTokens.get(resetToken);

    if (!resetRequest) {
      res.status(400).json({
        error: 'Invalid or expired password reset request.'
      });
      return;
    }

    if (Date.now() > resetRequest.expiresAt) {
      passwordResetTokens.delete(resetToken);

      res.status(400).json({
        error: 'Password reset request has expired. Please start again.'
      });
      return;
    }

    const newPasswordHash = bcrypt.hashSync(
      newPassword,
      10
    );

    await pool.query(
      `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      `,
      [newPasswordHash, resetRequest.userId]
    );

    passwordResetTokens.delete(resetToken);

    res.json({
      message: 'Password reset successfully.'
    });
  } catch (error) {
    console.error('Reset password error:', error);

    res.status(500).json({
      error: 'Unable to reset password.'
    });
  }
};