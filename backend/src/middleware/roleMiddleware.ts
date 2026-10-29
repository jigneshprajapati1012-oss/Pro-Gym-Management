import {
  Response,
  NextFunction
} from 'express';

import { AuthRequest } from './authMiddleware';

export const requireRole = (
  allowedRole: 'OWNER' | 'TRAINER'
) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      res.status(401).json({
        error: 'User authentication required.'
      });
      return;
    }

    if (req.user.role !== allowedRole) {
      res.status(403).json({
        error: `Access denied. ${allowedRole} access is required.`
      });
      return;
    }

    next();
  };
};
