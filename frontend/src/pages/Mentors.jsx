import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Linkedin, Twitter, Globe } from 'lucide-react';
import { getAllMentors } from '../services/mentorService';

const Mentors = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMentors = async () => {
            const data = await getAllMentors();
            // Filter only valid profiles if needed (e.g. approved mentors)
            setMentors(data);
            setLoading(false);
        };
        fetchMentors();
    }, []);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Learn from the World's Best</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Our mentors are industry leaders from top tech companies who are passionate about sharing their knowledge.</p>
        </div>

        {loading ? (
            <div className="text-center py-20 text-gray-500">Loading mentors...</div>
        ) : mentors.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No mentors found.</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mentors.map((mentor) => (
                    <div key={mentor.uid || mentor.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-8 flex flex-col items-center text-center group">
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-gray-100 group-hover:border-blue-100 transition-colors">
                            <img 
                                src={mentor.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.uid}`} 
                                alt={mentor.name} 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{mentor.name || mentor.displayName}</h3>
                        <p className="text-blue-600 font-medium mb-1">{mentor.role === 'mentor' ? 'Senior Mentor' : mentor.role}</p>
                        <p className="text-gray-500 mb-6">{mentor.bio ? mentor.bio.substring(0, 50) + '...' : 'Expert Instructor'}</p>
                        
                        <div className="flex gap-4">
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-50 rounded-full transition-colors">
                                <Twitter className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                                <Globe className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <button className="mt-8 w-full border border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all">
                            View Profile
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Mentors;
