import asyncHandler from 'express-async-handler';
import Payment from '../models/Payment.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

// @desc    Process mock payment and enroll student
// @route   POST /api/payments/mock
// @access  Private/Student
const processMockPayment = asyncHandler(async (req, res) => {
  const { courseId, paymentMethod } = req.body;

  if (!courseId || !paymentMethod) {
    res.status(400);
    throw new Error('Course ID and Payment Method are required');
  }

  const course = await Course.findById(courseId);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if student is already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
  });

  if (existingEnrollment) {
    res.status(400);
    throw new Error('You are already enrolled in this course');
  }

  // Determine final price (use discountPrice if available)
  const amountToPay = course.discountPrice ? course.discountPrice : course.price;

  // Generate a mock transaction ID
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const transactionId = `MOCK-TXN-${dateStr}-${randomStr}`;

  // 1. Create Mock Payment Record
  const payment = await Payment.create({
    student: req.user._id,
    course: courseId,
    amount: amountToPay,
    paymentMethod,
    transactionId,
    status: 'success', // Simulating successful immediate payment
  });

  // 2. Create Enrollment Record
  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: courseId,
    payment: payment._id,
    completedLessons: [],
    progress: 0,
    isCompleted: false,
  });

  // 3. Update Course Statistics
  course.totalStudents += 1;
  await course.save();

  res.status(201).json({
    message: 'Payment successful and enrollment created',
    paymentId: payment._id,
    transactionId: payment.transactionId,
    enrollmentId: enrollment._id,
  });
});

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({})
    .populate('student', 'name email')
    .populate('course', 'title price')
    .sort({ createdAt: -1 });

  res.json(payments);
});

export { processMockPayment, getPayments };