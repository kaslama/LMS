import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  content: {
    type: String, // Text content or mixed HTML
  },
  resources: [
    {
      title: String,
      url: String,
    },
  ],
  duration: {
    type: Number, // In minutes
    default: 0,
  },
  order: {
    type: Number,
    required: true,
  },
  isPreview: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['video', 'text', 'quiz'],
    default: 'video',
  },
});

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a course title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Please add a thumbnail URL'],
    },
    instructor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    discountPrice: {
      type: Number,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'All Levels',
    },
    language: {
      type: String,
      default: 'English',
    },
    learningObjectives: {
      type: [String],
      required: true,
    },
    requirements: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'unpublished'],
      default: 'draft',
    },
    sections: [sectionSchema],
    averageRating: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating must can not be more than 5'],
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;