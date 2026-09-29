import express from 'express';
import { markLessonComplete } from '../controllers/progressController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/lesson', protect, authorize('student'), markLessonComplete);

export default router; 