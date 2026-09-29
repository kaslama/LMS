import React, { useState, useEffect } from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      // Include unpublished/drafts by overriding status
      const { data } = await api.get('/courses?limit=100&status=');
      setCourses(data.courses || []);
    } catch (error) {
      toast.error('Failed to load platform courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('ADMIN ACTION: Are you sure you want to completely delete this course from the platform?')) {
      try {
        await api.delete(`/courses/${id}`);
        toast.success('Course deleted from platform');
        fetchCourses();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Platform Courses</h1>
      
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-red-800 font-medium">Administrator Privileges</h3>
          <p className="text-red-700 text-sm mt-1">
            As an admin, you have the authority to view and delete any course on the platform, regardless of its publication status or instructor.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{course.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{course.category?.name} • {formatCurrency(course.price)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.instructor?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.totalStudents} Enrollments
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleDelete(course._id)} 
                      className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                      title="Force Delete Course"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;