import asyncHandler from 'express-async-handler';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Certificate from '../models/Certificate.js';

// @desc    Mark a lesson as complete and update progress
// @route   POST /api/progress/lesson
// @access  Private/Student
const markLessonComplete = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.body;

  if (!courseId || !lessonId) {
    res.status(400);
    throw new Error('Course ID and Lesson ID are required');
  }

  // Find the student's enrollment
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
  });

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  // If already completed the course, just return
  if (enrollment.isCompleted) {
    return res.json({ message: 'Course is already completed', progress: 100, isCompleted: true });
  }

  // Get the course to count total lessons
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  let totalLessons = 0;
  course.sections.forEach((section) => {
    totalLessons += section.lessons.length;
  });

  if (totalLessons === 0) {
    res.status(400);
    throw new Error('Course has no lessons to complete');
  }

  // Check if lesson is already in completedLessons array
  const alreadyCompleted = enrollment.completedLessons.includes(lessonId);

  if (!alreadyCompleted) {
    enrollment.completedLessons.push(lessonId);
  }

  // Calculate new progress percentage
  const completedCount = enrollment.completedLessons.length;
  let progressPercentage = Math.round((completedCount / totalLessons) * 100);
  
  if (progressPercentage > 100) progressPercentage = 100;

  enrollment.progress = progressPercentage;

  let newCertificate = null;

  // Check if course is now fully completed
  if (progressPercentage === 100 && !enrollment.isCompleted) {
    enrollment.isCompleted = true;
    enrollment.completedAt = Date.now();

    // Generate Certificate
    const certDateStr = new Date().getFullYear().toString();
    const certNumStr = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit random
    const certificateId = `LMS-${certDateStr}-${certNumStr}`;

    newCertificate = await Certificate.create({
      student: req.user._id,
      course: courseId,
      certificateId,
    });
  }

  await enrollment.save();

  res.json({
    message: 'Lesson marked as complete',
    progress: enrollment.progress,
    completedLessons: enrollment.completedLessons,
    isCompleted: enrollment.isCompleted,
    certificate: newCertificate,
  });
});

export { markLessonComplete };