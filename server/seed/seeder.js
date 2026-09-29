import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';

import User from '../models/User.js';
import Category from '../models/Category.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import Certificate from '../models/Certificate.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Clear all existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Course.deleteMany();
    await Enrollment.deleteMany();
    await Payment.deleteMany();
    await Certificate.deleteMany();

    // 1. Create Users (Updated to properly hash passwords)
    const usersData = [
      {
        name: 'System Admin',
        email: 'admin@lms.com',
        password: 'Admin@123',
        role: 'admin',
      },
      {
        name: 'John Instructor',
        email: 'instructor@lms.com',
        password: 'Instructor@123',
        role: 'instructor',
      },
      {
        name: 'Jane Instructor',
        email: 'jane@lms.com',
        password: 'Instructor@123',
        role: 'instructor',
      },
      {
        name: 'Test Student',
        email: 'student@lms.com',
        password: 'Student@123',
        role: 'student',
      },
      {
        name: 'Alice Student',
        email: 'alice@lms.com',
        password: 'Student@123',
        role: 'student',
      },
    ];

    // Use a loop with User.create() so the pre('save') hashing middleware runs for each user
    const users = [];
    for (const userData of usersData) {
      const user = await User.create(userData);
      users.push(user);
    }

    const admin = users[0]._id;
    const instructor1 = users[1]._id;
    const instructor2 = users[2]._id;
    const student1 = users[3]._id;

    // 2. Create Categories
    const categories = await Category.insertMany([
      { name: 'Web Development', description: 'Learn to build modern websites.' },
      { name: 'Programming', description: 'Core programming concepts.' },
      { name: 'Data Science', description: 'Analyze data and build ML models.' },
      { name: 'Design', description: 'UI/UX and graphic design.' },
      { name: 'Marketing', description: 'Digital marketing and SEO.' },
    ]);

    // 3. Create Courses
    const courses = await Course.insertMany([
      {
        title: 'MERN Stack Development Masterclass',
        description: 'Build robust full-stack web applications using MongoDB, Express, React, and Node.js.',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
        instructor: instructor1,
        category: categories[0]._id,
        price: 99.99,
        discountPrice: 49.99,
        level: 'All Levels',
        language: 'English',
        learningObjectives: ['Build an API with Express', 'Create a React SPA', 'Connect to MongoDB'],
        requirements: ['Basic HTML, CSS, and JS knowledge'],
        status: 'published',
        sections: [
          {
            title: 'Introduction to Node.js',
            order: 1,
            lessons: [
              {
                title: 'What is Node.js?',
                description: 'Overview of the runtime environment.',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                duration: 10,
                order: 1,
                isPreview: true,
                type: 'video',
              },
              {
                title: 'Setting up Express',
                description: 'Creating your first server.',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                duration: 15,
                order: 2,
                type: 'video',
              },
            ],
          },
          {
            title: 'React Fundamentals',
            order: 2,
            lessons: [
              {
                title: 'Components & State',
                description: 'Understanding React core concepts.',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                duration: 20,
                order: 1,
                type: 'video',
              },
            ],
          },
        ],
      },
      {
        title: 'JavaScript Fundamentals',
        description: 'Master the basics of JS before moving to frameworks.',
        thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=800&auto=format&fit=crop',
        instructor: instructor1,
        category: categories[1]._id,
        price: 49.99,
        level: 'Beginner',
        language: 'English',
        learningObjectives: ['Variables', 'Functions', 'DOM Manipulation'],
        requirements: ['None'],
        status: 'published',
        sections: [
          {
            title: 'Getting Started',
            order: 1,
            lessons: [
              {
                title: 'Variables and Data Types',
                description: 'Learn let, const, and var.',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                duration: 12,
                order: 1,
                isPreview: true,
                type: 'video',
              },
            ],
          },
        ],
      },
      {
        title: 'React for Beginners',
        description: 'Step by step guide to mastering React.',
        thumbnail: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=800&auto=format&fit=crop',
        instructor: instructor2,
        category: categories[0]._id,
        price: 79.99,
        discountPrice: 59.99,
        level: 'Beginner',
        language: 'English',
        learningObjectives: ['JSX', 'Hooks', 'Context API'],
        requirements: ['JavaScript knowledge'],
        status: 'published',
        sections: [
          {
            title: 'React Basics',
            order: 1,
            lessons: [
              {
                title: 'Hello React',
                description: 'First app.',
                videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
                duration: 8,
                order: 1,
                type: 'video',
              },
            ],
          },
        ],
      },
    ]);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Course.deleteMany();
    await Enrollment.deleteMany();
    await Payment.deleteMany();
    await Certificate.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}