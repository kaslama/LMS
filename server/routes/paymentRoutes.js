import express from 'express';
import {
  processMockPayment,
  getPayments,
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/mock', protect, authorize('student'), processMockPayment);
router.get('/', protect, authorize('admin'), getPayments);

export default router;