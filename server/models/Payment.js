import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Mock Card', 'Mock Wallet', 'Mock Bank'],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;