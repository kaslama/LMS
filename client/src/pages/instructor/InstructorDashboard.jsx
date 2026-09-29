import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, DollarSign, BarChart2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import Spinner from '../../components/ui/Spinner';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const { data } = await api.get(`/courses?instructor=${user._id}&limit=100`);
        const instructorCourses = data.courses || [];
        setCourses(instructorCourses);
        
        let students = 0;
        let revenue = 0;
        let published = 0;

        instructorCourses.forEach(course => {
          students += course.totalStudents || 0;
          const coursePrice = course.discountPrice ? course.discountPrice : course.price;
          revenue += (course.totalStudents || 0) * coursePrice;
          if (course.status === 'published') published++;
        });

        setStats({
          totalCourses: instructorCourses.length,
          publishedCourses: published,
          totalStudents: students,
          totalRevenue: revenue
        });

      } catch (error) {
        console.error('Failed to fetch instructor dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user._id) {
      fetchInstructorData();
    }
  }, [user]);

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.name}. Here's how your courses are performing.</p>
        </div>
        <Link to="/instructor/courses/create" className="btn-primary">
          Create New Course
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {stats.publishedCourses} published, {stats.totalCourses - stats.publishedCourses} drafts
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Across all your courses
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Simulated Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Lifetime earnings (Mock)
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <BarChart2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Engagement</p>
              <p className="text-2xl font-bold text-gray-900">Good</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Based on completed lessons
          </div>
        </div>
      </div>

      {/* Recent Courses List */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Your Courses</h2>
          <Link to="/instructor/courses" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        
        {courses.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            You haven't created any courses yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.slice(0, 5).map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-16">
                          <img className="h-10 w-16 rounded object-cover" src={course.thumbnail} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{course.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(course.discountPrice || course.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.totalStudents || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;