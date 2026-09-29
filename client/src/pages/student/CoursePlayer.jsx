import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// FIX: Added 'Award' to the lucide-react imports
import { Menu, X, ArrowLeft, CheckCircle, Circle, PlayCircle, Award } from 'lucide-react';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both Course structure and User's Enrollment data
        const [courseRes, enrollRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/enrollments/check/${courseId}`)
        ]);

        if (!enrollRes.data.isEnrolled) {
          toast.error("You must purchase this course first");
          navigate(`/courses/${courseId}`);
          return;
        }

        setCourse(courseRes.data);
        setEnrollment(enrollRes.data.enrollment);

        // Find the first uncompleted lesson, or default to very first lesson
        const sections = courseRes.data.sections;
        let startLesson = null;
        
        if (sections && sections.length > 0) {
          const completedIds = enrollRes.data.enrollment.completedLessons || [];
          for (let section of sections) {
            for (let lesson of section.lessons) {
              if (!completedIds.includes(lesson._id)) {
                startLesson = lesson;
                break;
              }
            }
            if (startLesson) break;
          }
          
          // FIX: Stronger fallback. If all completed, find the very first available lesson safely
          if (!startLesson) {
            for (let section of sections) {
              if (section.lessons && section.lessons.length > 0) {
                startLesson = section.lessons[0];
                break;
              }
            }
          }
        }
        setActiveLesson(startLesson);
      } catch (error) {
        console.error("Error loading player", error);
        toast.error("Error loading course content");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, navigate]);

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    setCompleting(true);
    
    try {
      const { data } = await api.post('/progress/lesson', {
        courseId,
        lessonId: activeLesson._id
      });
      
      // Update local enrollment state
      setEnrollment({
        ...enrollment,
        progress: data.progress,
        completedLessons: data.completedLessons,
        isCompleted: data.isCompleted
      });
      
      if (data.isCompleted && !enrollment.isCompleted) {
        toast.success("Congratulations! You have completed the course! 🎉", { duration: 5000 });
      } else {
        toast.success("Lesson completed!");
      }
      
      // Try to navigate to next lesson automatically
      let foundCurrent = false;
      let nextLesson = null;
      for (let section of course.sections) {
        for (let lesson of section.lessons) {
          if (foundCurrent) {
            nextLesson = lesson;
            break;
          }
          if (lesson._id === activeLesson._id) {
            foundCurrent = true;
          }
        }
        if (nextLesson) break;
      }
      
      if (nextLesson) {
        setActiveLesson(nextLesson);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark complete");
    } finally {
      setCompleting(false);
    }
  };

  const isCompleted = (lessonId) => {
    return enrollment?.completedLessons?.includes(lessonId);
  };

  if (loading) return <div className="h-screen w-screen"><Spinner size="xl" /></div>;
  if (!course || !enrollment) return null;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar for Desktop */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} flex-shrink-0 transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden flex flex-col absolute z-20 h-full md:relative`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-gray-900 text-white shrink-0">
          <h2 className="font-semibold truncate pr-2 text-sm" title={course.title}>{course.title}</h2>
          <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 border-b border-gray-200 shrink-0">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Course Progress</span>
            <span className="font-semibold text-gray-700">{enrollment.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${enrollment.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
              style={{ width: `${enrollment.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow custom-scrollbar">
          {course.sections.map((section, sIdx) => (
            <div key={section._id} className="border-b border-gray-200">
              <div className="bg-gray-100 px-4 py-3 font-semibold text-sm text-gray-800">
                Section {sIdx + 1}: {section.title}
              </div>
              <div>
                {section.lessons.map((lesson, lIdx) => (
                  <button
                    key={lesson._id}
                    onClick={() => { setActiveLesson(lesson); if(window.innerWidth < 768) setSidebarOpen(false); }}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${activeLesson?._id === lesson._id ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted(lesson._id) ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className={`text-sm ${activeLesson?._id === lesson._id ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
                        {lIdx + 1}. {lesson.title}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <PlayCircle className="h-3 w-3 mr-1" /> {lesson.duration} min
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none">
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link to="/student/learning" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
            </Link>
          </div>
          
          {enrollment.isCompleted && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
              <Award className="h-4 w-4" /> Course Completed
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
              {/* Video Player Placeholder / Iframe */}
              <div className="bg-black aspect-video rounded-lg shadow-lg overflow-hidden flex items-center justify-center relative mb-6">
                {activeLesson.videoUrl ? (
                  <video 
                    className="w-full h-full object-contain"
                    controls
                    src={activeLesson.videoUrl}
                    poster={course.thumbnail}
                  >
                    Your browser does not support HTML video.
                  </video>
                ) : (
                  <div className="text-white text-center p-8">
                    <PlayCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No video available for this lesson.</p>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start flex-wrap gap-4 mb-6 border-b border-gray-100 pb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{activeLesson.title}</h1>
                  </div>
                  
                  <button
                    onClick={handleMarkComplete}
                    disabled={completing || isCompleted(activeLesson._id)}
                    className={`btn ${isCompleted(activeLesson._id) ? 'bg-green-100 text-green-800 border border-green-200' : 'btn-primary'}`}
                  >
                    {completing ? 'Updating...' : isCompleted(activeLesson._id) ? (
                      <><CheckCircle className="h-4 w-4 mr-2" /> Completed</>
                    ) : (
                      'Mark as Complete'
                    )}
                  </button>
                </div>

                <div className="prose max-w-none text-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Lesson Description</h3>
                  <p>{activeLesson.description || 'No description provided.'}</p>
                  
                  {activeLesson.content && (
                    <div className="mt-6 border-t border-gray-100 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Content</h3>
                      <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="text-lg">Select a lesson from the sidebar to begin.</p>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default CoursePlayer;