import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, CheckCircle, Bot, Send, ChevronLeft, Menu, Video, FileText, Lock, ChevronDown, ChevronRight, Video as VideoIcon, ClipboardList, Upload, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCourseById } from '../services/courseService';
import { getCourseAssignments, getCourseQuizzes } from '../services/mentorService';
import { useAuth } from '../context/AuthContext';
import { getStudentEnrollment, updateEnrollmentProgress } from '../services/enrollmentService';
import { uploadToS3, getSecureUrl } from '../services/uploadService';

const CoursePlayer = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [activeTab, setActiveTab] = useState('curriculum');
    const [activeVideo, setActiveVideo] = useState(null);
    const [activeVideoUrl, setActiveVideoUrl] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', content: "Hi! I'm your AI Tutor. Ask me anything about this video or the course content!" }
    ]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedSections, setExpandedSections] = useState({ 0: true });
    
    // Assignment & Quiz Data
    const [assignments, setAssignments] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    
    // Student Progress Tracking
    const [completedVideos, setCompletedVideos] = useState([]); // Array of video IDs
    const [assignmentSubmissions, setAssignmentSubmissions] = useState({}); // { assignId: url }
    const [quizScores, setQuizScores] = useState({}); // { quizId: score }
    
    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            setLoading(true);
            try {
                const [courseData, assignmentsData, quizzesData, enrollmentData] = await Promise.all([
                    getCourseById(id),
                    getCourseAssignments(id),
                    getCourseQuizzes(id),
                    getStudentEnrollment(currentUser.uid, id)
                ]);

                if (courseData) {
                    setCourse(courseData);
                    setAssignments(assignmentsData || []);
                    setQuizzes(quizzesData || []);
                    setEnrollment(enrollmentData);
                    
                    if (enrollmentData) {
                        setCompletedVideos(enrollmentData.completedVideos || []);
                        setAssignmentSubmissions(enrollmentData.assignmentSubmissions || {});
                        setQuizScores(enrollmentData.quizScores || {});
                    }

                    // Load video if approved
                    if (enrollmentData?.status === 'approved' || !enrollmentData) { 
                        if (courseData.content && courseData.content.length > 0) {
                             const firstSection = courseData.content[0];
                             if (firstSection.videos && firstSection.videos.length > 0) {
                                 setActiveVideo(firstSection.videos[0]);
                             }
                        }
                    }
                }
            } catch (error) { // eslint-disable-line no-unused-vars
                console.error("Error loading course data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, currentUser]);

    // Progress Update Check
    const updateProgress = async (newCompletedVideos, newSubmissions, newQuizScores) => {
        let totalVideos = 0;
        course.content.forEach(s => totalVideos += (s.videos?.length || 0));
        
        const totalItems = totalVideos + assignments.length + quizzes.length;
        const completedCount = newCompletedVideos.length + Object.keys(newSubmissions).length + Object.keys(newQuizScores).length;
        
        const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
        const isCompleted = progress === 100;

        await updateEnrollmentProgress(currentUser.uid, id, {
            completedVideos: newCompletedVideos,
            assignmentSubmissions: newSubmissions,
            quizScores: newQuizScores,
            progress,
            completed: isCompleted
        });
        
        // Optimistic update
        setEnrollment(prev => ({ ...prev, progress, completed: isCompleted }));
    };

    const markVideoCompleted = async (videoId) => {
        if (!completedVideos.includes(videoId)) {
            const newCompleted = [...completedVideos, videoId];
            setCompletedVideos(newCompleted);
            await updateProgress(newCompleted, assignmentSubmissions, quizScores);
        }
    };

    const handleVideoEnded = () => {
        if (activeVideo) {
            markVideoCompleted(activeVideo.id);
        }
    };

    const handleAssignmentUpload = async (assignmentId, e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const { key } = await uploadToS3(file, `student-uploads/${currentUser.uid}/assignments`);
            const newSubmissions = { ...assignmentSubmissions, [assignmentId]: key };
            setAssignmentSubmissions(newSubmissions);
            await updateProgress(completedVideos, newSubmissions, quizScores);
            alert("Assignment submitted!");
        } catch (error) {
            alert("Upload failed");
        }
    };

    // Simulate Quiz Completion
    const handleQuizComplete = async (quizId) => {
        // In real app, this comes from Quiz component result
        const newScores = { ...quizScores, [quizId]: 100 };
        setQuizScores(newScores);
        await updateProgress(completedVideos, assignmentSubmissions, newScores);
        alert("Quiz completed!");
    };

    const toggleSection = (idx) => {
        setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const sections = course?.content ? course.content.map((c, idx) => ({
        title: c.section,
        videos: c.videos || []
    })) : [];

    // Resolve Video URL
    useEffect(() => {
        const resolveVideo = async () => {
            if (activeVideo?.url) {
                if (!activeVideo.url.startsWith('http')) {
                    const url = await getSecureUrl(activeVideo.url);
                    setActiveVideoUrl(url);
                } else {
                    setActiveVideoUrl(activeVideo.url);
                }
            }
        };
        resolveVideo();
    }, [activeVideo]);

    if (loading) return <div className="h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
    if (!course) return <div className="h-screen bg-gray-900 flex items-center justify-center text-white">Course not found</div>;

    if (enrollment && enrollment.status !== 'approved') {
        return (
            <div className="h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-8 text-center">
                <Lock className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Access Locked</h1>
                <p className="text-gray-400">Payment status: {enrollment.status}</p>
                <Link to="/my-learning" className="mt-8 px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                    Back to My Learning
                </Link>
            </div>
        );
    }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden font-sans">
      <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center gap-4">
            <Link to={`/my-learning`} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"><ChevronLeft className="h-5 w-5" /></Link>
            <div className="flex flex-col">
                <h1 className="font-bold text-base md:text-lg text-gray-100 truncate max-w-[200px] md:max-w-md">{course.title}</h1>
                <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${enrollment?.progress || 0}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500">{enrollment?.progress || 0}% Completed</span>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-6">
            {course.liveClassLink && (
                <a href={course.liveClassLink} target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors animate-pulse">
                    <VideoIcon className="h-3 w-3" /> Live Class {course.liveClassTime && `(${course.liveClassTime})`}
                </a>
            )}
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
                {currentUser?.displayName?.[0] || 'S'}
            </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col relative bg-black">
            <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
                <div className="w-full max-w-5xl aspect-video bg-gray-900 rounded-xl overflow-hidden relative group shadow-2xl border border-gray-800">
                    {activeVideoUrl ? (
                        <video 
                            key={activeVideoUrl}
                            controls 
                            autoPlay={true}
                            onEnded={handleVideoEnded}
                            className="w-full h-full object-contain bg-black"
                            poster={course.image} 
                        >
                            <source src={activeVideoUrl} type="video/mp4" />
                            <source src={activeVideoUrl} type="video/webm" />
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-center">
                            <p className="text-gray-500">Select a video to play</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="h-14 bg-gray-900 border-t border-gray-800 flex md:hidden items-center justify-between px-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Menu className="h-5 w-5" /> {sidebarOpen ? 'Hide' : 'Show'} Content
                </button>
            </div>
        </div>

        <AnimatePresence>
            {sidebarOpen && (
                <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 400, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="bg-gray-900 border-l border-gray-800 flex flex-col absolute md:relative right-0 h-full z-20 w-[400px] shadow-2xl"
                >
                    <div className="flex border-b border-gray-800 overflow-x-auto no-scrollbar">
                        {['curriculum', 'assignments', 'quizzes', 'certificate', 'ai'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 min-w-[70px] py-4 text-xs md:text-sm font-medium border-b-2 transition-all hover:bg-gray-800/50 capitalize ${activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-900/50">
                        {activeTab === 'curriculum' && (
                            <div className="p-0">
                                {sections.map((section, idx) => (
                                    <div key={idx} className="border-b border-gray-800 last:border-0">
                                        <button onClick={() => toggleSection(idx)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                                            <h3 className="font-semibold text-gray-200 text-sm text-left">{section.title}</h3>
                                            {expandedSections[idx] ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
                                        </button>
                                        <AnimatePresence>
                                            {expandedSections[idx] && (
                                                <div className="pb-2">
                                                    {section.videos.map((video) => (
                                                        <div 
                                                            key={video.id} 
                                                            onClick={() => setActiveVideo(video)}
                                                            className={`px-6 py-3 flex items-start gap-3 cursor-pointer transition-colors border-l-4 ${activeVideo?.id === video.id ? 'bg-blue-900/20 border-blue-500' : 'border-transparent hover:bg-gray-800'}`}
                                                        >
                                                            <div className="mt-0.5">
                                                                {completedVideos.includes(video.id) ? <CheckCircle className="h-4 w-4 text-green-500" /> : <div className="h-4 w-4 rounded-full border border-gray-600"></div>}
                                                            </div>
                                                            <p className={`text-sm font-medium ${activeVideo?.id === video.id ? 'text-blue-400' : 'text-gray-300'}`}>{video.title}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'assignments' && (
                            <div className="p-6 space-y-4">
                                {assignments.length === 0 && <p className="text-gray-500 text-sm">No assignments.</p>}
                                {assignments.map(a => (
                                    <div key={a.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                        <div className="flex gap-3 mb-3">
                                            <FileText className="h-5 w-5 text-green-400" />
                                            <div><h4 className="font-bold text-gray-200 text-sm">{a.title}</h4><p className="text-xs text-gray-500">Due: {a.deadline}</p></div>
                                        </div>
                                        {a.file && <SecureDownloadLink fileKey={a.file} label="Download" />}
                                        <div className="mt-3 relative">
                                            <input type="file" onChange={(e) => handleAssignmentUpload(a.id, e)} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.doc,.docx" />
                                            <button className={`w-full py-2 rounded-lg text-xs font-bold ${assignmentSubmissions[a.id] ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                                                {assignmentSubmissions[a.id] ? "Resubmit" : "Upload Submission"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'quizzes' && (
                            <div className="p-6 space-y-4">
                                {quizzes.length === 0 && <p className="text-gray-500 text-sm">No quizzes.</p>}
                                {quizzes.map(q => (
                                    <div key={q.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                        <h4 className="font-bold text-gray-200 text-sm mb-2">{q.title}</h4>
                                        {quizScores[q.id] ? (
                                            <div className="text-green-400 text-sm font-bold">Completed: {quizScores[q.id]}%</div>
                                        ) : (
                                            <button onClick={() => handleQuizComplete(q.id)} className="w-full py-2 rounded-lg bg-orange-600 text-white text-xs font-bold">Start Quiz</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'certificate' && (
                            <div className="p-6 text-center">
                                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                                    <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-100 mb-2">Course Certificate</h3>
                                    {enrollment?.completed ? (
                                        <button onClick={() => alert("Downloading Certificate...")} className="w-full py-3 bg-yellow-500 text-gray-900 rounded-lg font-bold hover:bg-yellow-400">Download</button>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 uppercase bg-gray-900 py-2 rounded-lg">
                                            <Lock className="w-3 h-3" /> Locked
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'ai' && <div className="p-4 text-gray-400 text-sm text-center">AI Tutor available for premium users.</div>}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SecureDownloadLink = ({ fileKey, label }) => {
    const [url, setUrl] = useState(null);
    useEffect(() => {
        const fetch = async () => {
            if (fileKey && !fileKey.startsWith('http')) {
                const link = await getSecureUrl(fileKey);
                setUrl(link);
            } else { setUrl(fileKey); }
        };
        fetch();
    }, [fileKey]);
    if (!url) return null;
    return <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-gray-700 text-white text-xs font-bold hover:bg-gray-600 mb-2"><FileText className="w-3 h-3"/> {label}</a>;
};

export default CoursePlayer;
