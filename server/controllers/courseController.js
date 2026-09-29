import asyncHandler from 'express-async-handler';
import Course from '../models/Course.js';
import jwt from 'jsonwebtoken';

// @desc    Get all courses (with search, filter, pagination)
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.search
    ? {
        title: {
          $regex: req.query.search,
          $options: 'i',
        },
      }
    : {};

  const category = req.query.category ? { category: req.query.category } : {};
  const level = req.query.level ? { level: req.query.level } : {};
  
  // Default to only published courses
  const statusFilter = req.query.status ? { status: req.query.status } : { status: 'published' };
  
  let instructorFilter = {};
  if (req.query.instructor) {
    instructorFilter = { instructor: req.query.instructor };
    
    // Check if the user is asking for their own courses
    // Since this is a public route, we manually verify the token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // If the logged-in user matches the instructor being queried, allow seeing drafts
        if (decoded.id === req.query.instructor) {
          delete statusFilter.status; 
        }
      } catch (error) {
        // Invalid token, do nothing (keeps the 'published' filter active)
      }
    }
  }

  const query = { ...keyword, ...category, ...level, ...statusFilter, ...instructorFilter };

  const count = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('instructor', 'name profileImage')
    .populate('category', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    courses,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name profileImage bio')
    .populate('category', 'name');

  if (course) {
    res.json(course);
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Instructor
const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    thumbnail,
    category,
    price,
    discountPrice,
    level,
    language,
    learningObjectives,
    requirements,
  } = req.body;

  const course = new Course({
    instructor: req.user._id,
    title,
    description,
    thumbnail,
    category,
    price,
    discountPrice,
    level,
    language,
    learningObjectives,
    requirements,
    status: 'draft',
    sections: [],
  });

  const createdCourse = await course.save();
  res.status(201).json(createdCourse);
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Ensure only the course owner or an admin can edit it
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update this course');
  }

  // Update the course with all incoming data from req.body (dynamically handles the entire 'sections' array replacement)
  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedCourse);
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor/Admin
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this course');
  }

  await course.deleteOne();
  res.json({ message: 'Course removed successfully' });
});

// @desc    Add a section to a course
// @route   POST /api/courses/:id/sections
// @access  Private/Instructor
const addSection = asyncHandler(async (req, res) => {
  const { title, order } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to modify this course');
  }

  const newSection = {
    title,
    order: order || course.sections.length + 1,
    lessons: [],
  };

  course.sections.push(newSection);
  await course.save();

  res.status(201).json(course.sections[course.sections.length - 1]);
});

// @desc    Add a lesson to a section
// @route   POST /api/courses/:courseId/sections/:sectionId/lessons
// @access  Private/Instructor
const addLesson = asyncHandler(async (req, res) => {
  const { title, description, videoUrl, content, duration, isPreview, type, order } = req.body;
  
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to modify this course');
  }

  const section = course.sections.id(req.params.sectionId);
  
  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }

  const newLesson = {
    title,
    description,
    videoUrl,
    content,
    duration: duration || 0,
    isPreview: isPreview || false,
    type: type || 'video',
    order: order || section.lessons.length + 1,
  };

  section.lessons.push(newLesson);
  await course.save();

  res.status(201).json(section.lessons[section.lessons.length - 1]);
});

export {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addSection,
  addLesson
};