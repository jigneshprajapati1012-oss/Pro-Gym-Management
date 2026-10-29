import { Router } from 'express';
import { getMembers, getMemberById, createMember, updateMember, deleteMember } from '../controllers/membersController';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getMembers);
router.get('/:id', getMemberById);
router.post('/', requireRole('OWNER'), createMember);
router.put('/:id', requireRole('OWNER'), updateMember);
router.delete('/:id', requireRole('OWNER'), deleteMember);

export default router;

