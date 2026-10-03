import express from 'express';
import { createQuiz, getQuizByLesson, submitQuiz, updateQuiz } from '../controllers/quizController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('instructor', 'admin'), createQuiz);
router.get('/lesson/:lessonId', protect, getQuizByLesson);
router.post('/:id/submit', protect, authorize('student'), submitQuiz);

// Added the PUT route to handle updates securely
router.put('/:id', protect, authorize('instructor', 'admin'), updateQuiz);

export default router;