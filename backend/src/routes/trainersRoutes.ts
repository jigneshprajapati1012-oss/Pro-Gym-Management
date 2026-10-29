import { Router } from 'express';
import { getTrainers, getTrainerById, createTrainer, updateTrainer, assignMembersToTrainer, deleteTrainer } from '../controllers/trainersController';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);
router.use(requireRole('OWNER'));

router.get('/', getTrainers);
router.get('/:id', getTrainerById);
router.post('/', createTrainer);
router.put('/:id', updateTrainer);
router.post('/:id/assign-members', assignMembersToTrainer);
router.delete('/:id', deleteTrainer);

export default router;

