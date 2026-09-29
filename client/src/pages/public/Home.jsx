import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, PlayCircle } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import Spinner from '../../components/ui/Spinner';

const Home = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get('/courses?limit=4');
        setFeaturedCourses(data.courses || []);
      } catch (error) {
        console.error('Failed to fetch featured courses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
              Unlock Your Potential with MERN LMS
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-blue-100">
              Master the latest skills with high-quality courses created by industry experts. Build your future today.
            </p>
            <div className="flex gap-4">
              <Link to="/courses" className="bg-white text-blue-600 hover:bg-gray-50 px-6 py-3 rounded-md font-semibold shadow-md transition-colors">
                Browse Courses
              </Link>
              <Link to="/register" className="border border-white hover:bg-blue-700 px-6 py-3 rounded-md font-semibold transition-colors">
                Join for Free
              </Link>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop" 
              alt="Students learning" 
              className="rounded-lg shadow-xl object-cover h-80 w-full"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full text-blue-600 mb-4">
              <PlayCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Learn at Your Own Pace</h3>
            <p className="text-gray-600">Access video lessons and resources anytime, anywhere on any device.</p>
          </div>
          <div className="p-6">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full text-blue-600 mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Expert Instructors</h3>
            <p className="text-gray-600">Learn directly from industry professionals with real-world experience.</p>
          </div>
          <div className="p-6">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full text-blue-600 mb-4">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Earn Certificates</h3>
            <p className="text-gray-600">Showcase your newly acquired skills with verifiable completion certificates.</p>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Courses</h2>
            <Link to="/courses" className="text-blue-600 font-medium hover:text-blue-800">
              View all &rarr;
            </Link>
          </div>
          
          {loading ? (
            <Spinner />
          ) : featuredCourses.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No courses available yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCourses.map((course) => (
                <Link to={`/courses/${course._id}`} key={course._id} className="card hover:shadow-lg transition-shadow">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      {course.category?.name || 'Uncategorized'}
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-gray-900 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{course.instructor?.name}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {course.discountPrice ? (
                          <>
                            <span className="text-lg font-bold text-gray-900">{formatCurrency(course.discountPrice)}</span>
                            <span className="text-sm text-gray-400 line-through">{formatCurrency(course.price)}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">{formatCurrency(course.price)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;