import React from 'react';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-lg text-gray-900">MERN LMS</span>
            </div>
            <p className="text-gray-500 text-sm">
              Empowering learners and instructors with a modern, fast, and reliable learning management system.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><a href="/courses" className="text-sm text-gray-500 hover:text-gray-900">Browse Courses</a></li>
              <li><a href="/register" className="text-sm text-gray-500 hover:text-gray-900">Become a Student</a></li>
              <li><a href="/register" className="text-sm text-gray-500 hover:text-gray-900">Teach on LMS</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Help Center</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="text-sm text-gray-500">support@mernlms.com</li>
              <li className="text-sm text-gray-500">+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 flex items-center justify-between">
          <p className="text-base text-gray-400">
            &copy; {new Date().getFullYear()} MERN LMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;