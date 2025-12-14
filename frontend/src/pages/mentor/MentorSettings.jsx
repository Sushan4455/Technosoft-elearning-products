import React, { useState, useEffect } from 'react';
import { useMentorAuth } from '../../context/MentorAuthContext';
import { Save, User, Globe, DollarSign, Camera } from 'lucide-react';
import { updateMentorProfile } from '../../services/mentorService';
import { uploadToS3, getSecureUrl } from '../../services/uploadService';

const MentorSettings = () => {
  const { currentMentor, mentorProfile } = useMentorAuth();
  const [formData, setFormData] = useState({
      name: '',
      bio: '',
      skills: '',
      website: '',
      bankAccount: ''
  });
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
      if (mentorProfile) {
          setFormData({
              name: mentorProfile.name || currentMentor?.displayName || '',
              bio: mentorProfile.bio || '',
              skills: mentorProfile.skills || '',
              website: mentorProfile.website || '',
              bankAccount: mentorProfile.bankAccount || ''
          });
          const loadPhoto = async () => {
              if (mentorProfile.photoUrl) {
                  if (mentorProfile.photoUrl.startsWith('http')) {
                      setPhotoUrl(mentorProfile.photoUrl);
                  } else {
                      const url = await getSecureUrl(mentorProfile.photoUrl);
                      setPhotoUrl(url);
                  }
              } else {
                  setPhotoUrl(currentMentor?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentMentor?.uid}`);
              }
          };
          loadPhoto();
      }
  }, [mentorProfile, currentMentor]);

  const handleSave = async () => {
      setLoading(true);
      try {
          await updateMentorProfile(currentMentor.uid, formData);
          alert("Profile updated successfully!");
      } catch (error) {
          alert("Failed to update profile");
      } finally {
          setLoading(false);
      }
  };

  const handlePhotoUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
          try {
              const { key } = await uploadToS3(file, `mentor-uploads/${currentMentor.uid}/profile`);
              await updateMentorProfile(currentMentor.uid, { photoUrl: key });
              
              const url = await getSecureUrl(key);
              setPhotoUrl(url);
          } catch (error) {
              alert("Photo upload failed");
          }
      }
  };

  return (
    <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentor Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
                    <div className="relative inline-block mb-4 group">
                        <img 
                            src={photoUrl} 
                            alt="Profile" 
                            className="w-32 h-32 rounded-full border-4 border-gray-50 mx-auto object-cover"
                        />
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 cursor-pointer">
                            <Camera className="w-4 h-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </label>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900">{formData.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">Mentor</p>
                </div>
            </div>

            {/* Forms */}
            <div className="md:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" /> Personal Details
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea rows="4" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-600" /> Social & Payment
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                            <input type="url" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account (Payouts)</label>
                            <div className="relative">
                                <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                <input type="text" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500" value={formData.bankAccount} onChange={(e) => setFormData({...formData, bankAccount: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button 
                        onClick={handleSave} 
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" /> {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default MentorSettings;
