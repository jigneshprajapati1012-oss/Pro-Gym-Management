import { Router } from 'express';
import { getAttendance, markAttendance, deleteAttendance } from '../controllers/attendanceController';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getAttendance);
router.post('/', markAttendance);
router.delete('/:id', requireRole('OWNER'), deleteAttendance);

export default router;

