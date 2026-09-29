import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addSection,
  addLesson
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getCourses)
  .post(protect, authorize('instructor', 'admin'), createCourse);

router
  .route('/:id')
  .get(getCourseById)
  .put(protect, authorize('instructor', 'admin'), updateCourse)
  .delete(protect, authorize('instructor', 'admin'), deleteCourse);

router
  .route('/:id/sections')
  .post(protect, authorize('instructor', 'admin'), addSection);

router
  .route('/:courseId/sections/:sectionId/lessons')
  .post(protect, authorize('instructor', 'admin'), addLesson);

export default router;