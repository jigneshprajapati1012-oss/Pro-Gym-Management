import { Router } from 'express';

import {
  createQuery,
  getQueries,
  updateQueryStatus,
  deleteQuery,
  replyToQuery
} from '../controllers/queriesController';

import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/', createQuery);

router.get('/', authenticate, getQueries);

router.patch('/:id/status', authenticate, updateQueryStatus);
router.post('/:id/reply', authenticate, replyToQuery);

router.delete('/:id', authenticate, deleteQuery);

export default router;