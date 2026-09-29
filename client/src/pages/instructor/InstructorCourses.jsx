import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, PlusCircle, Search } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const InstructorCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCourses = async () => {
    try {
      const { data } = await api.get(`/courses?instructor=${user._id}&limit=100`);
      setCourses(data.courses || []);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchCourses();
    }
    // eslint-disable-next-line
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await api.delete(`/courses/${id}`);
        toast.success('Course deleted successfully');
        fetchCourses();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
        <Link to="/instructor/courses/create" className="btn-primary flex items-center">
          <PlusCircle className="h-5 w-5 mr-2" />
          Create Course
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search your courses..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <Spinner size="lg" />
        ) : filteredCourses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-6">You haven't created any courses yet, or none match your search.</p>
            <Link to="/instructor/courses/create" className="btn-primary">Create Your First Course</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img className="h-12 w-20 rounded object-cover border border-gray-200" src={course.thumbnail} alt="" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">{course.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{course.category?.name || 'Uncategorized'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.totalStudents || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(course.discountPrice || course.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => navigate(`/instructor/courses/${course._id}/edit`)} 
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Course"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(course._id)} 
                          className="text-red-600 hover:text-red-900"
                          title="Delete Course"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
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

export default InstructorCourses;