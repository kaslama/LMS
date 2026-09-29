import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle, Clock, Globe, Award, Shield } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState({ isEnrolled: false, loading: true });
  
  // Modal state
  const [showCheckout, setShowCheckout] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Mock Card');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setCourse(data);
      } catch (error) {
        toast.error('Course not found');
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, navigate]);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user) {
        setEnrollmentStatus({ isEnrolled: false, loading: false });
        return;
      }
      try {
        const { data } = await api.get(`/enrollments/check/${id}`);
        setEnrollmentStatus({ isEnrolled: data.isEnrolled, loading: false });
      } catch (error) {
        setEnrollmentStatus({ isEnrolled: false, loading: false });
      }
    };
    if (id) {
      checkEnrollment();
    }
  }, [id, user]);

  const handleMockPayment = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);
    
    // Simulate network delay for realism
    setTimeout(async () => {
      try {
        const { data } = await api.post('/payments/mock', {
          courseId: course._id,
          paymentMethod
        });
        toast.success('Payment successful! You are now enrolled.');
        setShowCheckout(false);
        navigate(`/student/learning/${course._id}`);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Payment failed');
      } finally {
        setProcessingPayment(false);
      }
    }, 1500);
  };

  if (loading) return <Spinner size="xl" />;
  if (!course) return null;

  return (
    <div className="bg-gray-50 pb-12">
      {/* Course Header */}
      <div className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 text-sm text-blue-400 font-semibold mb-4">
              <span>{course.category?.name}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">{course.title}</h1>
            <p className="text-lg text-gray-300 mb-6">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>{course.level}</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>{course.language}</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>Certificate of Completion</span>
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-4">
              <img 
                src={course.instructor?.profileImage || 'https://via.placeholder.com/150'} 
                alt={course.instructor?.name} 
                className="h-12 w-12 rounded-full border-2 border-gray-600 object-cover"
              />
              <div>
                <p className="text-sm text-gray-400">Created by</p>
                <p className="font-semibold text-white">{course.instructor?.name}</p>
              </div>
            </div>
          </div>
          
          {/* Floating Action Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-xl text-gray-900 overflow-hidden lg:-mt-24 sticky top-24">
              <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  {course.discountPrice ? (
                    <>
                      <span className="text-3xl font-extrabold text-gray-900">{formatCurrency(course.discountPrice)}</span>
                      <span className="text-lg text-gray-400 line-through">{formatCurrency(course.price)}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-extrabold text-gray-900">{formatCurrency(course.price)}</span>
                  )}
                </div>
                
                {enrollmentStatus.loading ? (
                  <button className="w-full btn-primary py-3 flex justify-center opacity-70" disabled>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </button>
                ) : !user ? (
                  <Link to="/login" className="w-full btn-primary py-3 text-lg flex justify-center text-center">
                    Log in to Enroll
                  </Link>
                ) : enrollmentStatus.isEnrolled ? (
                  <Link to={`/student/learning/${course._id}`} className="w-full btn-secondary py-3 text-lg flex justify-center text-center">
                    Continue Learning
                  </Link>
                ) : (
                  <button 
                    onClick={() => setShowCheckout(true)}
                    className="w-full btn-primary py-3 text-lg font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Buy Now
                  </button>
                )}
                
                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold text-gray-900">This course includes:</h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-center gap-3">
                      <PlayCircle className="h-5 w-5 text-gray-400" />
                      <span>On-demand video lessons</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span>Full lifetime access</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:w-2/3 pr-0 lg:pr-8">
          
          {/* Learning Objectives */}
          <div className="mb-12 border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {course.learningObjectives?.map((obj, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {course.requirements?.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Course Content / Sections */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              {course.sections?.map((section, idx) => (
                <div key={section._id} className={idx !== 0 ? 'border-t border-gray-200' : ''}>
                  <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <span className="text-sm text-gray-500">{section.lessons?.length} lectures</span>
                  </div>
                  <div className="px-6 py-2">
                    {section.lessons?.map((lesson) => (
                      <div key={lesson._id} className="py-3 flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <PlayCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-600">{lesson.title}</p>
                            {lesson.isPreview && (
                              <span className="inline-block mt-1 text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded">Preview available</span>
                            )}
                          </div>
                        </div>
                        {lesson.duration > 0 && (
                          <span className="text-xs text-gray-500">{lesson.duration} min</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => !processingPayment && setShowCheckout(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Complete Your Purchase</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-md mb-6 flex gap-4 border border-gray-200">
                      <img src={course.thumbnail} alt={course.title} className="w-20 h-16 object-cover rounded" />
                      <div>
                        <h4 className="font-semibold text-gray-900 line-clamp-1">{course.title}</h4>
                        <p className="text-gray-500 text-sm">by {course.instructor?.name}</p>
                        <p className="font-bold text-gray-900 mt-1">
                          {formatCurrency(course.discountPrice || course.price)}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleMockPayment}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment Method (Mock Data)</label>
                        <select 
                          className="input-field bg-white"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          disabled={processingPayment}
                        >
                          <option value="Mock Card">Credit/Debit Card</option>
                          <option value="Mock Wallet">Digital Wallet</option>
                          <option value="Mock Bank">Bank Transfer</option>
                        </select>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800 mb-6">
                        <strong>Note:</strong> This is a mock payment system. No real money will be charged.
                      </div>

                      <div className="flex flex-col sm:flex-row-reverse gap-2">
                        <button
                          type="submit"
                          disabled={processingPayment}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {processingPayment ? 'Processing...' : `Pay ${formatCurrency(course.discountPrice || course.price)}`}
                        </button>
                        <button
                          type="button"
                          disabled={processingPayment}
                          className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                          onClick={() => setShowCheckout(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;