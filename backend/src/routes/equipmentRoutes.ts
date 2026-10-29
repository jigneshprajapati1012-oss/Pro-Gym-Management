import { Router } from 'express';
import { getEquipment, createEquipment, updateEquipment, deleteEquipment } from '../controllers/equipmentController';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);
router.use(requireRole('OWNER'));

router.get('/', getEquipment);
router.post('/', createEquipment);
router.put('/:id', updateEquipment);
router.delete('/:id', deleteEquipment);

export default router;

