import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { PlayCircle, Award, Search, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudentEnrollment } from '../services/enrollmentService';
import { getCourseById } from '../services/courseService';
import { motion } from 'framer-motion';

const MyLearning = () => {
    const { userProfile, currentUser, loading: authLoading } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, completed

    useEffect(() => {
        let isMounted = true;

        if (authLoading) {
            // Wait for auth to settle
            return;
        }

        if (!currentUser) {
            // If auth is done and no user, we are done loading
            if (isMounted) setLoading(false);
            return;
        }

        const fetchCourses = async () => {
            if (userProfile?.enrolledCourses) {
                const enriched = await Promise.all(userProfile.enrolledCourses.map(async (item) => {
                    const courseDetails = await getCourseById(item.courseId);
                    if (!courseDetails) return null;
                    const enrollmentStatus = await getStudentEnrollment(currentUser.uid, item.courseId);
                    return {
                        ...item,
                        details: courseDetails,
                        status: enrollmentStatus?.status || 'approved'
                    };
                }));
                
                if (isMounted) {
                    const validCourses = enriched.filter(c => c !== null);
                    const approvedCourses = validCourses.filter(c => c.status === 'approved');
                    setCourses(approvedCourses);
                    setLoading(false);
                }
            } else {
                if (isMounted) setLoading(false);
            }
        };
        
        fetchCourses();

        return () => { isMounted = false; };
    }, [userProfile, currentUser, authLoading]);

    const filteredCourses = courses.filter(c => {
        if (filter === 'completed') return c.progress === 100;
        if (filter === 'active') return c.progress < 100;
        return true;
    });

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />
      
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">My Learning</h1>
            <div className="flex flex-col md:flex-row gap-6 justify-between items-end">
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                    {['all', 'active', 'completed'].map((f) => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${
                                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading || authLoading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course, idx) => {
                    const details = course.details;
                    return (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img 
                                    src={details.image} 
                                    alt={details.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <Link to={`/learn/${course.courseId}`} className="w-full bg-white text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
                                        <PlayCircle className="w-5 h-5" /> Resume Learning
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2" title={details.title}>
                                    {details.title}
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">{details.instructor}</p>
                                
                                <div className="mt-auto">
                                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                                        <span>{course.progress}% Completed</span>
                                        {course.progress === 100 && <span className="text-green-600 flex items-center gap-1"><Award className="w-3 h-3"/> Certified</span>}
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${course.progress}%` }}
                                            className={`h-full rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        ) : (
            <div className="text-center py-32">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">You haven’t enrolled in any course yet</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Explore our wide range of courses and start your journey today.</p>
                <Link to="/courses" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-600/20">
                    <Search className="w-5 h-5" /> Browse Courses
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;
