import { Router } from 'express';
import { getDashboardAnalytics, getFullReport } from '../controllers/reportsController';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardAnalytics);
router.get('/export', requireRole('OWNER'), getFullReport);

export default router;

