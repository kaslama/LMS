import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';

const MyLearning = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const { data } = await api.get('/enrollments/my-enrollments');
        setEnrollments(data);
      } catch (error) {
        console.error('Failed to fetch enrollments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Learning</h1>

      {loading ? (
        <Spinner size="lg" />
      ) : enrollments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
          <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">You haven't enrolled in any courses yet</h3>
          <p className="text-gray-500 mb-6">Explore our catalog and find the perfect course for you.</p>
          <Link to="/courses" className="btn-primary">Browse Courses</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment._id} className="card flex flex-col hover:shadow-lg transition-shadow">
              <img 
                src={enrollment.course?.thumbnail} 
                alt={enrollment.course?.title} 
                className="w-full h-40 object-cover"
              />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">{enrollment.course?.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{enrollment.course?.instructor?.name}</p>
                
                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                    <span>{enrollment.progress === 100 ? 'Completed' : `${enrollment.progress}% Complete`}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className={`h-2 rounded-full transition-all ${enrollment.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                  
                  <Link 
                    to={`/student/learning/${enrollment.course?._id}`}
                    className="w-full block text-center py-2 bg-blue-50 text-blue-700 font-medium rounded hover:bg-blue-100 transition-colors"
                  >
                    {enrollment.progress === 0 ? 'Start Course' : enrollment.progress === 100 ? 'View Course' : 'Continue'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLearning;