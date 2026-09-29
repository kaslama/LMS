import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, TrendingUp, Clock } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/enrollments/my-enrollments');
        setEnrollments(data);
      } catch (error) {
        console.error('Failed to fetch enrollments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Spinner size="lg" />;

  const completedCourses = enrollments.filter(e => e.isCompleted).length;
  const inProgressCourses = enrollments.length - completedCourses;

  // Calculate average progress
  const totalProgress = enrollments.reduce((acc, curr) => acc + curr.progress, 0);
  const avgProgress = enrollments.length ? Math.round(totalProgress / enrollments.length) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
      <p className="text-gray-600 mb-8">Here's an overview of your learning journey.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Enrolled Courses</p>
            <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed</p>
            <p className="text-2xl font-bold text-gray-900">{completedCourses}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-gray-900">{inProgressCourses}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-100 flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Average Progress</p>
            <p className="text-2xl font-bold text-gray-900">{avgProgress}%</p>
          </div>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Learning</h2>
          <Link to="/student/learning" className="text-blue-600 hover:text-blue-800 font-medium">View all</Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-100">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
            <p className="text-gray-500 mb-6">You haven't enrolled in any courses.</p>
            <Link to="/courses" className="btn-primary">Browse Courses</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.slice(0, 3).map((enrollment) => (
              <div key={enrollment._id} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden flex flex-col">
                <img src={enrollment.course?.thumbnail} alt={enrollment.course?.title} className="w-full h-40 object-cover" />
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">{enrollment.course?.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{enrollment.course?.instructor?.name}</p>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                    
                    <Link 
                      to={`/student/learning/${enrollment.course?._id}`}
                      className="block w-full text-center py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors font-medium text-sm"
                    >
                      {enrollment.progress === 100 ? 'Review Course' : 'Continue Learning'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;