import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
    },
  ],
  points: {
    type: Number,
    default: 1,
  },
});

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: true,
    },
    lesson: {
      type: mongoose.Schema.ObjectId, // Reference to the specific lesson ID inside the course sections
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    questions: [questionSchema],
    passingScore: {
      type: Number,
      default: 70, // Percentage
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;