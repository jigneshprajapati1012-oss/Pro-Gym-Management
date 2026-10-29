import { Router } from 'express';
import { getPayments, getReceipt, createPayment, updatePayment, deletePayment } from '../controllers/paymentsController';
import { authenticate } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticate);
router.use(requireRole('OWNER')); // Strictly OWNER only!

router.get('/', getPayments);
router.get('/:id/receipt', getReceipt);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

export default router;

