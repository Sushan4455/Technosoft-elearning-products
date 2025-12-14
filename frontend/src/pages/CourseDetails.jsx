import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getCourseById } from '../services/courseService';
import { enrollInCourse } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { Star, Clock, Globe, Award, PlayCircle, CheckCircle, AlertCircle, Ticket, Video as VideoIcon, ArrowRight } from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      const data = await getCourseById(id);
      if (data) {
        setCourse(data);
      } else {
        setError("Course not found");
      }
      setLoading(false);
    };

    fetchCourse();
  }, [id]);

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'FREE2024') {
        setEnrolling(true);
        try {
            if (currentUser) {
                // Persist enrollment to backend
                await enrollInCourse(currentUser.uid, id);
            }
            // Navigate to player
            navigate(`/learn/${id}`);
        } catch (err) {
            console.error("Enrollment error:", err);
            // Even if backend update fails (e.g. offline), let them in if code is valid
            navigate(`/learn/${id}`); 
        } finally {
            setEnrolling(false);
        }
    } else {
        setCouponError('Invalid coupon code. Try "FREE2024"');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you are looking for does not exist or has been removed.</p>
          <Link to="/courses" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Browse All Courses
          </Link>
        </div>
      </div>
    );
  }

  // Ensure default values for missing data properties to prevent crashes
  const instructor = typeof course.instructor === 'string'
    ? { name: course.instructor, role: "Instructor", image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}` }
    : (course.instructor || { name: "Unknown Instructor", role: "Instructor", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=instructor" });

  const whatYouWillLearn = course.whatYouWillLearn || ["Course content coming soon."];
  const content = course.content || [];
  const students = course.students || "0";
  const language = course.language || "English";
  const lastUpdated = course.lastUpdated || "Recently";

  return (
    <div className="bg-white min-h-screen relative">
      <Navbar />
      
      {/* Hero Header */}
      <div className="bg-gray-900 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-12">
          <div className="md:w-2/3">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{course.title}</h1>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
              <span className="bg-yellow-500 text-gray-900 px-2 py-0.5 rounded font-bold text-xs uppercase">Bestseller</span>
              <div className="flex items-center text-yellow-400 font-bold gap-1">
                {course.rating} <Star className="h-4 w-4 fill-current" />
              </div>
              <span className="text-gray-400">({course.reviews} ratings)</span>
              <span className="text-gray-300">•</span>
              <span className="text-white font-medium">{students} students</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-300 font-medium">
                <span className="flex items-center gap-2"><Clock className="h-4 w-4"/> Last updated {lastUpdated}</span>
                <span className="flex items-center gap-2"><Globe className="h-4 w-4"/> {language}</span>
                {course.liveClassLink && (
                    <a href={course.liveClassLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors bg-red-900/30 px-3 py-1 rounded-full animate-pulse border border-red-500/30">
                        <VideoIcon className="h-4 w-4" /> Live Class Available
                    </a>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Content */}
          <div className="lg:w-2/3 order-2 lg:order-1">
            
            {/* Live Class CTA if applicable */}
            {course.liveClassLink && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-blue-900 mb-1 flex items-center gap-2"><VideoIcon className="w-5 h-5 text-red-500" /> Live Interactive Sessions</h3>
                        <p className="text-blue-700 text-sm">Join the instructor for weekly live Q&A and coding sessions via Google Meet.</p>
                    </div>
                    <a href={course.liveClassLink} target="_blank" rel="noopener noreferrer" className="bg-white text-blue-600 border border-blue-200 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap flex items-center gap-2">
                        Join Class <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            )}

            {/* What you'll learn */}
            <div className="border border-gray-200 p-8 rounded-2xl mb-10 bg-gray-50/50">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                {whatYouWillLearn.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Course Content</h2>
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
                    {content.length > 0 ? content.map((section, idx) => (
                        <div key={idx} className="p-5 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors group">
                            <div className="flex items-center gap-4">
                                <PlayCircle className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                <span className="font-medium text-gray-900">{section.section}</span>
                            </div>
                            <span className="text-sm text-gray-500">{section.lectures} lectures • {section.duration}</span>
                        </div>
                    )) : (
                        <div className="p-6 text-center text-gray-500">No content available yet.</div>
                    )}
                </div>
            </div>

            {/* Instructor */}
            <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Instructor</h2>
                <div className="flex items-start gap-6">
                    <img 
                      src={instructor.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=instructor"} 
                      alt={instructor.name} 
                      className="w-20 h-20 rounded-full border-2 border-gray-100 shadow-sm" 
                    />
                    <div>
                        <h3 className="text-xl font-bold text-blue-600 hover:underline cursor-pointer">{instructor.name}</h3>
                        <p className="text-gray-600 font-medium mb-3">{instructor.role}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">I am a professional instructor with over 10 years of experience in the field. I love teaching and helping others learn. My courses are designed to take you from beginner to advanced levels.</p>
                    </div>
                </div>
            </div>

          </div>

          {/* Sidebar Card (Floating on Desktop) */}
          <div className="lg:w-1/3 order-1 lg:order-2 relative z-10">
            <div className="bg-white p-2 shadow-2xl rounded-2xl border border-gray-200 lg:absolute lg:-top-96 lg:right-0 w-full">
                <div className="p-4">
                  {/* Preview Image */}
                  <div className="aspect-video bg-gray-900 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                      <img src={course.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-opacity" />
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PlayCircle className="h-8 w-8 text-white fill-current" />
                      </div>
                  </div>
                  
                  <div className="flex items-end gap-3 mb-6 px-2">
                      <span className="text-3xl font-bold text-gray-900">Free</span>
                      <span className="text-lg text-gray-400 line-through mb-1 font-medium">$89.99</span>
                      <span className="text-sm font-bold text-green-600 mb-2 ml-auto">100% OFF</span>
                  </div>
                  
                  <button 
                      onClick={() => navigate('/payment', { state: { course } })}
                      className="block w-full bg-blue-600 text-white text-center py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 mb-4"
                  >
                      Buy Now
                  </button>
                  
                  <button 
                      onClick={() => setShowCouponModal(true)}
                      className="block w-full bg-white text-blue-600 border border-blue-200 text-center py-3 rounded-xl font-bold hover:bg-blue-50 transition-all mb-4"
                  >
                      Have a Coupon?
                  </button>
                  
                  <div className="space-y-4 text-sm text-gray-600 px-2 pb-2">
                      <div className="flex items-center gap-3"><Award className="h-5 w-5 text-gray-400"/> Certificate of completion</div>
                      <div className="flex items-center gap-3"><Globe className="h-5 w-5 text-gray-400"/> Full lifetime access</div>
                      <div className="flex items-center gap-3"><PlayCircle className="h-5 w-5 text-gray-400"/> Access on mobile and TV</div>
                  </div>
                </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Enter Coupon Code</h3>
                    <button onClick={() => setShowCouponModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Ticket className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">Use code <strong>FREE2024</strong> to get instant access to this course for free!</p>
                </div>

                <form onSubmit={handleCouponSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                            placeholder="Ex: FREE2024"
                            value={couponCode}
                            onChange={(e) => {
                                setCouponCode(e.target.value);
                                setCouponError('');
                            }}
                        />
                        {couponError && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle className="h-3 w-3"/> {couponError}</p>}
                    </div>
                    
                    <button type="submit" disabled={enrolling} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center">
                        {enrolling ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Apply & Start Learning'}
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default CourseDetails;
