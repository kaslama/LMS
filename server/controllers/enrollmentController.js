import asyncHandler from 'express-async-handler';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

// @desc    Get all enrollments for a user (My Learning)
// @route   GET /api/enrollments/my-enrollments
// @access  Private/Student
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: 'course',
      select: 'title thumbnail instructor level',
      populate: {
        path: 'instructor',
        select: 'name',
      },
    })
    .sort({ createdAt: -1 });

  res.json(enrollments);
});

// @desc    Check if user is enrolled in a course
// @route   GET /api/enrollments/check/:courseId
// @access  Private
const checkEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (enrollment) {
    res.json({ isEnrolled: true, enrollment });
  } else {
    res.json({ isEnrolled: false });
  }
});

// @desc    Get enrollment details (including progress)
// @route   GET /api/enrollments/:id
// @access  Private
const getEnrollmentById = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id).populate(
    'course'
  );

  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  // Ensure the user requesting is the enrolled student, an instructor of the course, or an admin
  if (
    enrollment.student.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to view this enrollment');
  }

  res.json(enrollment);
});

export { getMyEnrollments, checkEnrollment, getEnrollmentById };