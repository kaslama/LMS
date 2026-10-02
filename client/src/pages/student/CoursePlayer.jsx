import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  
  // --- QUIZ STATE ---
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]); // Array of { questionId, selectedOptionId }
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Reset quiz state whenever the active lesson changes
  useEffect(() => {
    setQuizPassed(false);
    setQuizData(null);
    setQuizAnswers([]);
    setQuizResult(null);

    // If the new lesson is a quiz, fetch its data
    if (activeLesson?.type === 'quiz') {
      const fetchQuiz = async () => {
        setLoadingQuiz(true);
        try {
          const { data } = await api.get(`/quizzes/lesson/${activeLesson._id}`);
          setQuizData(data);
        } catch (error) {
          toast.error("Could not load quiz data.");
        } finally {
          setLoadingQuiz(false);
        }
      };
      fetchQuiz();
    }
  }, [activeLesson]);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  // --- QUIZ HANDLERS ---
  const handleOptionSelect = (questionId, optionId) => {
    const existingAnswerIndex = quizAnswers.findIndex(a => a.questionId === questionId);
    const newAnswers = [...quizAnswers];
    
    if (existingAnswerIndex >= 0) {
      newAnswers[existingAnswerIndex].selectedOptionId = optionId;
    } else {
      newAnswers.push({ questionId, selectedOptionId: optionId });
    }
    setQuizAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    if (!quizData) return;
    
    if (quizAnswers.length < quizData.questions.length) {
      return toast.error("Please answer all questions before submitting.");
    }

    setIsSubmittingQuiz(true);
    try {
      const { data } = await api.post(`/quizzes/${quizData._id}/submit`, {
        answers: quizAnswers
      });
      
      setQuizResult(data);
      if (data.passed) {
        setQuizPassed(true);
        toast.success(`Quiz passed! You scored ${data.percentage}%`);
      } else {
        toast.error(`You scored ${data.percentage}%. You need ${quizData.passingScore}% to pass. Try again!`);
      }
    } catch (error) {
      toast.error("Failed to submit quiz.");
    } finally {
      setIsSubmittingQuiz(false);
    }
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
                        {lesson.type === 'quiz' ? <Award className="h-3 w-3 mr-1" /> : <PlayCircle className="h-3 w-3 mr-1" />}
                        {lesson.type === 'quiz' ? 'Quiz Module' : `${lesson.duration} min`}
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
              
              {/* CONDITIONAL RENDER: QUIZ OR VIDEO */}
              {activeLesson.type === 'quiz' ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
                  <div className="flex items-center gap-3 mb-6 border-b pb-4">
                    <Award className="h-8 w-8 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Quiz: {activeLesson.title}</h2>
                  </div>
                  
                  {loadingQuiz ? (
                    <div className="py-8"><Spinner size="md" /></div>
                  ) : !quizData ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                      This quiz does not have any questions yet.
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex justify-between items-center bg-blue-50 p-4 rounded border border-blue-100">
                        <span className="text-blue-800 font-medium">Passing Score Required: {quizData.passingScore}%</span>
                        {quizResult && (
                          <span className={`font-bold ${quizResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                            Your Score: {quizResult.percentage}%
                          </span>
                        )}
                      </div>

                      {quizData.questions.map((question, qIdx) => (
                        <div key={question._id} className="p-5 border border-gray-200 rounded-lg shadow-sm">
                          <h3 className="font-semibold text-gray-900 mb-4">{qIdx + 1}. {question.questionText} <span className="text-sm text-gray-400 font-normal">({question.points} pts)</span></h3>
                          
                          <div className="space-y-3 pl-2">
                            {question.options.map((option) => {
                              const isSelected = quizAnswers.find(a => a.questionId === question._id)?.selectedOptionId === option._id;
                              
                              return (
                                <label 
                                  key={option._id} 
                                  className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                                    isSelected ? 'bg-blue-50 border-blue-400' : 'border-gray-200 hover:bg-gray-50'
                                  }`}
                                >
                                  <input 
                                    type="radio" 
                                    name={`question-${question._id}`}
                                    checked={isSelected}
                                    onChange={() => handleOptionSelect(question._id, option._id)}
                                    disabled={quizResult?.passed} // Disable inputs if they already passed
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-3"
                                  />
                                  <span className="text-gray-700">{option.text}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {!quizPassed && (
                        <button 
                          className="btn-primary w-full sm:w-auto px-8"
                          onClick={handleSubmitQuiz}
                          disabled={isSubmittingQuiz}
                        >
                          {isSubmittingQuiz ? 'Grading...' : 'Submit Answers'}
                        </button>
                      )}

                      {quizResult && !quizResult.passed && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 flex items-center justify-between">
                          <span>You didn't pass this time. Review the material and try again.</span>
                          <button onClick={() => { setQuizResult(null); setQuizAnswers([]); }} className="text-red-600 font-bold hover:underline">Retake Quiz</button>
                        </div>
                      )}
                      
                      {quizPassed && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800">
                          <strong>Excellent!</strong> You passed the quiz. You may now mark this module as complete below.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* VIDEO PLAYER (Default) */
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
              )}
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start flex-wrap gap-4 mb-6 border-b border-gray-100 pb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{activeLesson.title}</h1>
                  </div>
                  
                  <button
                    onClick={handleMarkComplete}
                    disabled={completing || isCompleted(activeLesson._id) || (activeLesson.type === 'quiz' && !quizPassed)}
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