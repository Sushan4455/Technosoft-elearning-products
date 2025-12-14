import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, CheckCircle } from 'lucide-react';
import { getMentorCourses, createQuiz } from '../../services/mentorService';
import { useMentorAuth } from '../../context/MentorAuthContext';

const QuizBuilder = () => {
  const { currentMentor } = useMentorAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Quiz Meta
  const [quizTitle, setQuizTitle] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourseName, setSelectedCourseName] = useState('');

  const [questions, setQuestions] = useState([
      { id: Date.now(), text: '', options: ['', '', '', ''], correct: 0 }
  ]);

  useEffect(() => {
      const fetchCourses = async () => {
          if (currentMentor) {
              const data = await getMentorCourses(currentMentor.uid);
              setCourses(data);
          }
      };
      fetchCourses();
  }, [currentMentor]);

  const addQuestion = () => {
      setQuestions([...questions, { id: Date.now(), text: '', options: ['', '', '', ''], correct: 0 }]);
  };

  const updateQuestion = (id, field, value) => {
      setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (qId, optIdx, value) => {
      setQuestions(questions.map(q => {
          if (q.id === qId) {
              const newOpts = [...q.options];
              newOpts[optIdx] = value;
              return { ...q, options: newOpts };
          }
          return q;
      }));
  };

  const setCorrect = (qId, optIdx) => {
      setQuestions(questions.map(q => q.id === qId ? { ...q, correct: optIdx } : q));
  };

  const handleSave = async () => {
      if (!quizTitle || !selectedCourseId) {
          alert("Please enter a title and select a course.");
          return;
      }

      setLoading(true);
      try {
          await createQuiz({
              title: quizTitle,
              courseId: selectedCourseId,
              courseName: selectedCourseName,
              questions,
              mentorId: currentMentor.uid
          });
          alert("Quiz saved successfully!");
          // Reset or navigate
          setQuizTitle('');
          setSelectedCourseId('');
          setQuestions([{ id: Date.now(), text: '', options: ['', '', '', ''], correct: 0 }]);
      } catch (e) { // eslint-disable-line no-unused-vars
          alert("Failed to save quiz");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Quiz Builder</h1>
            <button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg disabled:opacity-50 transition-colors"
            >
                {loading ? "Saving..." : <><Save className="w-5 h-5" /> Save Quiz</>}
            </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
                    <input 
                        type="text" 
                        placeholder="e.g. React Hooks Quiz" 
                        className="w-full px-4 py-3 border rounded-lg text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Course</label>
                    <select 
                        className="w-full px-4 py-3 border rounded-lg outline-none bg-white focus:ring-2 focus:ring-blue-500"
                        value={selectedCourseId}
                        onChange={(e) => {
                            setSelectedCourseId(e.target.value);
                            const course = courses.find(c => c.id === e.target.value);
                            setSelectedCourseName(course ? course.title : '');
                        }}
                    >
                        <option value="">Select Course</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            {questions.map((q, idx) => (
                <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative group transition-all hover:border-blue-200">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                {idx + 1}
                            </span>
                            Question Text
                        </h3>
                        {questions.length > 1 && (
                            <button 
                                onClick={() => setQuestions(questions.filter(qi => qi.id !== q.id))}
                                className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    
                    <input 
                        type="text" 
                        placeholder="Enter question text..." 
                        className="w-full px-4 py-3 border rounded-lg mb-6 focus:outline-none focus:border-blue-500 font-medium"
                        value={q.text}
                        onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${q.correct === optIdx ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <button 
                                    onClick={() => setCorrect(q.id, optIdx)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${q.correct === optIdx ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 hover:border-blue-400'}`}
                                >
                                    {q.correct === optIdx && <CheckCircle className="w-4 h-4" />}
                                </button>
                                <input 
                                    type="text" 
                                    placeholder={`Option ${optIdx + 1}`}
                                    className="flex-1 bg-transparent outline-none text-sm text-gray-800 font-medium"
                                    value={opt}
                                    onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <button onClick={addQuestion} className="w-full py-4 mt-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Add Question
        </button>
    </div>
  );
};

export default QuizBuilder;
