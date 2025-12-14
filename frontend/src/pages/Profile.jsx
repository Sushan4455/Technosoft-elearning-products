import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { MapPin, Globe, Calendar, Link as LinkIcon, BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { userProfile, currentUser } = useAuth();
  
  const joinedDate = React.useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    return new Date(userProfile?.createdAt || Date.now()).toLocaleDateString();
  }, [userProfile?.createdAt]);

  // If user is not logged in or profile not loaded yet, show skeletal or loading
  if (!userProfile && !currentUser) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;

  // Use userProfile from context/db, fallback to defaults
  const profile = {
      name: userProfile?.name || currentUser?.displayName || "Anonymous User",
      username: userProfile?.username || "user123",
      bio: userProfile?.bio || "Lifelong learner. Passionate about technology and education.",
      location: userProfile?.country || "Unknown Location",
      joined: joinedDate,
      photoUrl: userProfile?.photoUrl || currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.uid}`,
      role: "Student",
      coursesEnrolled: userProfile?.enrolledCourses?.length || 0,
      website: "https://edupro.com"
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />
      
      {/* Profile Header Background */}
      <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <img 
                        src={profile.photoUrl} 
                        alt={profile.name} 
                        className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white"
                    />
                    <div className="flex-1 mt-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                                <p className="text-gray-500 font-medium">@{profile.username}</p>
                            </div>
                            {/* Corrected Link to Account Settings */}
                            <Link to="/account" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                Edit Profile
                            </Link>
                        </div>
                        
                        <p className="mt-4 text-gray-700 leading-relaxed max-w-2xl">{profile.bio}</p>
                        
                        <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                {profile.location}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                Joined {profile.joined}
                            </div>
                            <div className="flex items-center gap-1">
                                <LinkIcon className="w-4 h-4 text-gray-400" />
                                <a href={profile.website} className="text-blue-600 hover:underline">Website</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Stats/Tabs */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex gap-8">
                <div className="text-center">
                    <span className="block text-xl font-bold text-gray-900">{profile.coursesEnrolled}</span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Courses Enrolled</span>
                </div>
                <div className="text-center">
                    <span className="block text-xl font-bold text-gray-900">0</span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Certificates</span>
                </div>
                <div className="text-center">
                    <span className="block text-xl font-bold text-gray-900">0</span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reviews</span>
                </div>
            </div>
        </div>

        {/* Recent Activity / Enrolled Courses Preview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">About Me</h3>
                    <div className="prose text-gray-600">
                        <p>I am a student eager to learn full stack development. I have started with React and Node.js.</p>
                    </div>
                </div>
            </div>
            
            <div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {['JavaScript', 'React', 'HTML', 'CSS', 'Design'].map(skill => (
                            <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
