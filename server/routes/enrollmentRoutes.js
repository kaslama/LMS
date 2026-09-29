import express from 'express';
import {
  getMyEnrollments,
  checkEnrollment,
  getEnrollmentById,
} from '../controllers/enrollmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All enrollment routes require authentication
router.use(protect);

router.route('/my-enrollments').get(getMyEnrollments);
router.route('/check/:courseId').get(checkEnrollment);
router.route('/:id').get(getEnrollmentById);

export default router;