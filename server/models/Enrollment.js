import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: true,
    },
    payment: {
      type: mongoose.Schema.ObjectId,
      ref: 'Payment',
      required: true,
    },
    completedLessons: [
      {
        type: mongoose.Schema.ObjectId,
      },
    ],
    progress: {
      type: Number,
      default: 0, // Percentage 0-100
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from enrolling in the same course twice
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;