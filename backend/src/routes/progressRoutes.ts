import { Router } from 'express';
import { getProgressHistory, addProgressRecord, deleteProgressRecord } from '../controllers/progressController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getProgressHistory);
router.post('/', addProgressRecord);
router.delete('/:id', deleteProgressRecord);

export default router;

