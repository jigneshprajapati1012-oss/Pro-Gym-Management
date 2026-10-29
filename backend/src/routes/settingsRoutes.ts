import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', getSettings); // Publicly viewable for website footer / contact info if needed
router.put('/', authenticate, requireRole('OWNER'), updateSettings);

export default router;

