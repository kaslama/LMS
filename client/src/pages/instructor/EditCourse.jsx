import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import QuizModal from './QuizModal'; // IMPORTANT: Import the new component

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Tab State
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(true);
  
  // Form Details State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [thumbnail, setThumbnail] = useState('');
  
  // System & Curriculum State
  const [sections, setSections] = useState([]);
  const [status, setStatus] = useState('draft');

  // --- CLEANED UP QUIZ STATE ---
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuizLesson, setSelectedQuizLesson] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`);
        setTitle(data.title || '');
        setDescription(data.description || '');
        setPrice(data.price || 0);
        setDiscountPrice(data.discountPrice || 0);
        setThumbnail(data.thumbnail || '');
        setSections(data.sections || []);
        setStatus(data.status || 'draft');
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to load course details');
        navigate('/instructor/courses');
      }
    };

    fetchCourse();
  }, [id, navigate]);

  const handleUpdateBasicDetails = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/courses/${id}`, {
        title, description, price: Number(price), discountPrice: Number(discountPrice), thumbnail
      });
      toast.success('Course details updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update details');
    }
  };

  const handleAddSection = () => {
    setSections([...sections, { title: 'New Section', order: sections.length + 1, lessons: [] }]);
  };

  const handleDeleteSection = (index) => {
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
  };

  const handleSectionTitleChange = (text, index) => {
    const updated = [...sections];
    updated[index].title = text;
    setSections(updated);
  };

  const handleAddLesson = (sectionIndex) => {
    const updated = [...sections];
    updated[sectionIndex].lessons.push({
      title: 'New Lesson', videoUrl: '', description: '', duration: 0, order: updated[sectionIndex].lessons.length + 1, type: 'video'
    });
    setSections(updated);
  };

  const handleAddQuiz = (sectionIndex) => {
    const updated = [...sections];
    updated[sectionIndex].lessons.push({
      title: 'New Quiz', videoUrl: '', description: 'Answer the following questions to test your knowledge.', duration: 0, order: updated[sectionIndex].lessons.length + 1, type: 'quiz'
    });
    setSections(updated);
  };

  const handleDeleteLesson = (sectionIndex, lessonIndex) => {
    const updated = [...sections];
    updated[sectionIndex].lessons.splice(lessonIndex, 1);
    setSections(updated);
  };

  const handleLessonChange = (text, sectionIndex, lessonIndex, field) => {
    const updated = [...sections];
    updated[sectionIndex].lessons[lessonIndex][field] = text;
    setSections(updated);
  };

  const handleSaveCurriculum = async () => {
    try {
      await api.put(`/courses/${id}`, { sections });
      toast.success('Curriculum saved successfully!');
    } catch (error) {
      toast.error('Failed to save curriculum');
    }
  };

  const handlePublishToggle = async () => {
    try {
      if (status === 'draft') {
        if (sections.length === 0 || !sections[0].lessons || sections[0].lessons.length === 0) {
          return toast.error('You need at least one section and lesson to publish');
        }
      }
      const newStatus = status === 'draft' ? 'published' : 'draft';
      await api.put(`/courses/${id}`, { status: newStatus });
      setStatus(newStatus);
      toast.success(`Course ${newStatus} successfully!`);
    } catch (error) {
      toast.error('Failed to update course status');
    }
  };

  const openQuizModal = (lesson) => {
    setSelectedQuizLesson(lesson);
    setShowQuizModal(true);
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen text-gray-500">Loading course...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
        <button
          onClick={handlePublishToggle}
          className={`px-6 py-2 rounded-md text-white font-semibold shadow-sm transition-colors ${
            status === 'draft' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-yellow-500 hover:bg-yellow-600'
          }`}
        >
          {status === 'draft' ? 'Publish Course' : 'Unpublish to Draft'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'basic' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'}`}
          >
            Basic Details
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'curriculum' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'}`}
          >
            Course Curriculum
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'basic' && (
            <form onSubmit={handleUpdateBasicDetails} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Course Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Regular Price ($)</label>
                  <input type="number" min="0" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Price ($)</label>
                  <input type="number" min="0" step="0.01" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Thumbnail Image URL</label>
                <input type="url" required value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                {thumbnail && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Live Thumbnail Preview:</p>
                    <img src={thumbnail} alt="Thumbnail preview" className="h-56 w-full max-w-2xl object-cover rounded-lg border border-gray-200 shadow-sm" />
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-6 border-t border-gray-100">
                <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm">
                  Save Course Details
                </button>
              </div>
            </form>
          )}

          {activeTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Manage Sections & Lessons</h3>
                <button onClick={handleSaveCurriculum} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shadow-sm">
                  Save Curriculum
                </button>
              </div>

              {sections.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sections added yet. Click below to start building.</p>
              ) : (
                sections.map((section, sIndex) => (
                  <div key={sIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-4">
                      <input type="text" value={section.title} onChange={(e) => handleSectionTitleChange(e.target.value, sIndex)} className="font-bold text-lg bg-white border border-gray-300 rounded focus:border-blue-500 focus:outline-none px-3 py-1.5 w-2/3 shadow-sm" placeholder="Section Title (e.g. Introduction)" />
                      <button onClick={() => handleDeleteSection(sIndex)} className="text-red-500 text-sm font-medium hover:underline">Remove Section</button>
                    </div>

                    <div className="space-y-3 pl-4 border-l-2 border-blue-200 ml-2">
                      {section.lessons.map((lesson, lIndex) => (
                        <div key={lIndex} className="bg-white border border-gray-200 rounded-md p-4 flex flex-col gap-3 shadow-sm">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 w-1/2">
                              <span className={`text-xs font-bold px-2 py-1 rounded-md ${lesson.type === 'quiz' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{lesson.type === 'quiz' ? 'QUIZ' : 'VIDEO'}</span>
                              <input type="text" value={lesson.title} onChange={(e) => handleLessonChange(e.target.value, sIndex, lIndex, 'title')} className="font-medium text-gray-900 border border-gray-300 rounded px-3 py-1.5 w-full focus:border-blue-500" placeholder="Lesson Title" />
                            </div>
                            <button onClick={() => handleDeleteLesson(sIndex, lIndex)} className="text-red-400 text-xs font-medium hover:underline">Remove {lesson.type === 'quiz' ? 'Quiz' : 'Lesson'}</button>
                          </div>
                          
                          {lesson.type !== 'quiz' && (
                            <input type="text" value={lesson.videoUrl} onChange={(e) => handleLessonChange(e.target.value, sIndex, lIndex, 'videoUrl')} className="text-sm text-gray-600 border border-gray-300 rounded px-3 py-1.5 w-full focus:border-blue-500" placeholder="Video URL" />
                          )}
                          
                          <textarea rows={2} value={lesson.description || ''} onChange={(e) => handleLessonChange(e.target.value, sIndex, lIndex, 'description')} className="text-sm text-gray-600 border border-gray-300 rounded px-3 py-1.5 w-full focus:border-blue-500" placeholder={lesson.type === 'quiz' ? "Quiz Description / Instructions" : "Lesson Description"} />

                          {lesson.type === 'quiz' && (
                            <div className="bg-purple-50 p-4 rounded border border-purple-100 flex flex-col items-start gap-2">
                              {lesson._id ? (
                                <>
                                  <p className="text-sm text-purple-800 mb-1">Curriculum saved! You can now add questions and options.</p>
                                  <button type="button" onClick={() => openQuizModal(lesson)} className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-md hover:bg-purple-700 shadow-sm">Manage Quiz Questions & Options</button>
                                </>
                              ) : (
                                <span className="text-sm text-purple-800"><strong>Note:</strong> To add actual questions to this quiz, you must click the blue <strong>"Save Curriculum"</strong> button first.</span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <div className="flex gap-6 mt-2">
                        <button onClick={() => handleAddLesson(sIndex)} className="inline-block text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors">+ Add Video Lesson</button>
                        <button onClick={() => handleAddQuiz(sIndex)} className="inline-block text-sm text-purple-600 font-semibold hover:text-purple-800 transition-colors">+ Add Quiz Module</button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mt-6">
                <button onClick={handleAddSection} className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors shadow-sm">+ Add New Section</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RENDER THE NEW COMPONENT */}
      <QuizModal 
        isOpen={showQuizModal} 
        onClose={() => setShowQuizModal(false)} 
        lesson={selectedQuizLesson} 
        courseId={id} 
      />
    </div>
  );
};

export default EditCourse;