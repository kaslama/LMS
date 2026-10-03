import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const QuizModal = ({ isOpen, onClose, lesson, courseId }) => {
  const [quizId, setQuizId] = useState(null); // NEW: Track the existing quiz ID
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [passingScore, setPassingScore] = useState(70);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch quiz data when the modal opens
  useEffect(() => {
    if (!isOpen || !lesson) return;
    
    const fetchQuizData = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/quizzes/lesson/${lesson._id}`);
        setQuizId(data._id); // Track ID so we know to UPDATE instead of CREATE
        setQuizQuestions(data.questions || []);
        setPassingScore(data.passingScore || 70);
      } catch (error) {
        // Start with an empty question if no quiz exists yet
        setQuizId(null);
        setQuizQuestions([{ 
          questionText: '', 
          points: 1, 
          options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] 
        }]);
        setPassingScore(70);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [isOpen, lesson]);

  const saveQuizQuestions = async () => {
    setIsSavingQuiz(true);
    try {
      const payload = {
        courseId: courseId,
        lessonId: lesson._id,
        title: lesson.title,
        questions: quizQuestions,
        passingScore
      };

      // FIXED: If quiz exists, UPDATE it. If not, CREATE it.
      if (quizId) {
        await api.put(`/quizzes/${quizId}`, payload);
      } else {
        const { data } = await api.post('/quizzes', payload);
        setQuizId(data._id); // Save the new ID locally
      }
      
      toast.success('Quiz questions saved successfully!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save quiz questions');
    } finally {
      setIsSavingQuiz(false);
    }
  };

  const updateQuestion = (qIndex, field, value) => {
    setQuizQuestions(prev => prev.map((q, idx) => {
      if (idx === qIndex) return { ...q, [field]: value };
      return q;
    }));
  };

  const updateOption = (qIndex, oIndex, value) => {
    setQuizQuestions(prev => prev.map((q, idx) => {
      if (idx === qIndex) {
        return {
          ...q,
          options: q.options.map((opt, optIdx) => {
            if (optIdx === oIndex) return { ...opt, text: value };
            return opt;
          })
        };
      }
      return q;
    }));
  };

  const setCorrectOption = (qIndex, correctOptionIndex) => {
    setQuizQuestions(prev => prev.map((q, idx) => {
      if (idx === qIndex) {
        return {
          ...q,
          options: q.options.map((opt, optIdx) => ({
            ...opt,
            isCorrect: optIdx === correctOptionIndex
          }))
        };
      }
      return q;
    }));
  };

  if (!isOpen || !lesson) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Manage Questions: {lesson.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 font-bold text-xl">&times;</button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-gray-500">Loading quiz data...</div>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-4">
              <label className="font-semibold text-gray-700">Passing Score (%):</label>
              <input 
                type="number" min="0" max="100" 
                value={passingScore} onChange={(e) => setPassingScore(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 w-24 focus:border-purple-500"
              />
            </div>

            <div className="space-y-8">
              {quizQuestions.map((q, qIndex) => (
                <div key={qIndex} className="p-5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex justify-between mb-4">
                    <h3 className="font-bold text-gray-800">Question {qIndex + 1}</h3>
                    <button 
                      onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== qIndex))}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove Question
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    value={q.questionText}
                    onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                    placeholder="Enter your question here..."
                    className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:border-purple-500"
                  />

                  <div className="pl-4 border-l-2 border-purple-300 space-y-3">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Options (Select the correct one):</p>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name={`correct-${qIndex}`} 
                          // FIXED: Strict boolean check in case backend converts booleans to strings
                          checked={opt.isCorrect === true || opt.isCorrect === "true"} 
                          onChange={() => setCorrectOption(qIndex, oIndex)}
                          className="h-5 w-5 text-purple-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className={`flex-1 border rounded px-3 py-1.5 focus:border-purple-500 ${opt.isCorrect ? 'bg-purple-50 border-purple-300 font-medium' : 'border-gray-300'}`}
                        />
                        <button 
                          onClick={() => {
                            setQuizQuestions(prev => prev.map((qst, idx) => {
                              if (idx === qIndex) {
                                return { ...qst, options: qst.options.filter((_, i) => i !== oIndex) };
                              }
                              return qst;
                            }));
                          }}
                          className="text-red-400 text-sm hover:text-red-600"
                        >&times;</button>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => {
                        setQuizQuestions(prev => prev.map((qst, idx) => {
                          if (idx === qIndex) {
                            return { ...qst, options: [...qst.options, { text: '', isCorrect: false }] };
                          }
                          return qst;
                        }));
                      }}
                      className="text-sm text-purple-600 font-semibold hover:underline mt-2 inline-block"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center border-t pt-6">
              <button 
                onClick={() => setQuizQuestions([...quizQuestions, { questionText: '', points: 1, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }])}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded hover:bg-gray-300 transition-colors"
              >
                + Add Another Question
              </button>
              
              <div className="flex gap-3">
                <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                <button 
                  onClick={saveQuizQuestions} 
                  disabled={isSavingQuiz}
                  className="px-6 py-2 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 shadow disabled:opacity-70"
                >
                  {isSavingQuiz ? 'Saving...' : 'Save All Questions'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizModal;