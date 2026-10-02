import asyncHandler from 'express-async-handler';
import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';

// @desc    Create a quiz for a lesson
// @route   POST /api/quizzes
// @access  Private/Instructor
export const createQuiz = asyncHandler(async (req, res) => {
  const { courseId, lessonId, title, questions, passingScore } = req.body;

  // Verify the course belongs to the instructor (add your auth logic here)

  const quiz = await Quiz.create({
    course: courseId,
    lesson: lessonId,
    title,
    questions,
    passingScore
  });

  res.status(201).json(quiz);
});

// @desc    Get quiz by lesson ID
// @route   GET /api/quizzes/lesson/:lessonId
// @access  Private/Student/Instructor
export const getQuizByLesson = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ lesson: req.params.lessonId });
  
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  // Optional: Hide `isCorrect` from students before they submit
  if (req.user.role === 'student') {
    const studentQuiz = quiz.toObject();
    studentQuiz.questions.forEach(q => {
      q.options.forEach(opt => delete opt.isCorrect);
    });
    return res.json(studentQuiz);
  }

  res.json(quiz);
});

// @desc    Submit quiz and get score
// @route   POST /api/quizzes/:id/submit
// @access  Private/Student
export const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body; // Array of { questionId, selectedOptionId }
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  let score = 0;
  let totalPoints = 0;

  quiz.questions.forEach((question) => {
    totalPoints += question.points;
    const studentAnswer = answers.find(a => a.questionId === question._id.toString());
    
    if (studentAnswer) {
      const selectedOption = question.options.id(studentAnswer.selectedOptionId);
      if (selectedOption && selectedOption.isCorrect) {
        score += question.points;
      }
    }
  });

  const percentage = (score / totalPoints) * 100;
  const passed = percentage >= quiz.passingScore;

  res.json({ score, totalPoints, percentage, passed });
});