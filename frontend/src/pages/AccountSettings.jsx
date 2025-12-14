import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { 
  User, Lock, CreditCard, Camera, Save, 
  MapPin, Globe, Phone, Mail, Shield, AlertTriangle
} from 'lucide-react';
import { updateUserProfile, updateUserPhoto, updateUserSecurity, updateUserBilling, changeUserPassword } from '../services/userService';

const TabButton = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
      active 
        ? 'border-blue-600 text-blue-600' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const AccountSettings = () => {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    dob: '',
    country: '',
    gender: 'Prefer not to say'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        username: userProfile.username || '',
        email: userProfile.email || currentUser?.email || '',
        phone: userProfile.phone || '',
        dob: userProfile.dob || '',
        country: userProfile.country || '',
        gender: userProfile.gender || 'Prefer not to say'
      });
    }
  }, [userProfile, currentUser]);

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const success = await updateUserProfile(currentUser.uid, formData);
      if (success) {
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        return;
    }
    setLoading(true);
    try {
        await changeUserPassword(passwordData.newPassword);
        setMessage({ type: 'success', text: 'Password changed successfully.' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
        setMessage({ type: 'error', text: 'Failed to change password. (Requires recent login)' });
    } finally {
        setLoading(false);
    }
  };

  const resizeImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 300;
                const MAX_HEIGHT = 300;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
        };
    });
  };

  const handlePhotoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
          setMessage({ type: 'error', text: 'Image size must be less than 2MB' });
          return;
      }

      setLoading(true);
      try {
          const resizedImage = await resizeImage(file);
          await updateUserPhoto(currentUser.uid, resizedImage);
          setMessage({ type: 'success', text: 'Profile photo updated.' });
          // In a real app with context sync, this might be auto-reflected, but let's reload to be sure or depend on context update
          window.location.reload(); 
      } catch (err) {
          console.error(err);
          setMessage({ type: 'error', text: 'Failed to upload photo.' });
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <TabButton active={activeTab === 'personal'} label="Personal Details" icon={User} onClick={() => setActiveTab('personal')} />
            <TabButton active={activeTab === 'photo'} label="Profile Photo" icon={Camera} onClick={() => setActiveTab('photo')} />
            <TabButton active={activeTab === 'security'} label="Security" icon={Shield} onClick={() => setActiveTab('security')} />
            <TabButton active={activeTab === 'billing'} label="Billing Methods" icon={CreditCard} onClick={() => setActiveTab('billing')} />
          </div>

          <div className="p-8">
            {message.text && (
                <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.type === 'error' && <AlertTriangle className="w-4 h-4"/>}
                    {message.text}
                </div>
            )}

            {activeTab === 'personal' && (
              <form onSubmit={handleSavePersonal} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400 text-sm">@</span>
                        <input 
                        type="text" 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input 
                      type="date" 
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select 
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    >
                      <option value="">Select Country</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="NP">Nepal</option>
                      <option value="IN">India</option>
                    </select>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'photo' && (
              <div className="max-w-xl">
                <div className="flex items-center gap-8 mb-8">
                  <div className="relative group">
                    <img 
                      src={userProfile?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.uid}`} 
                      alt="Profile" 
                      className={`w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-sm ${loading ? 'opacity-50' : ''}`}
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {loading ? (
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Camera className="w-8 h-8 text-white" />
                        )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Profile Picture</h3>
                    <p className="text-sm text-gray-500 mb-4">PNG, JPG or GIF no bigger than 2MB.</p>
                    <label className={`bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors inline-block ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {loading ? 'Uploading...' : 'Upload new photo'}
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={loading} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
                <div className="max-w-2xl space-y-10">
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Change Password</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input 
                                type="password" 
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input 
                                type="password" 
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">Update Password</button>
                    </form>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Login History</h3>
                        <div className="space-y-4">
                            {userProfile?.security?.loginHistory?.map((login, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm py-2">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 p-2 rounded-full"><Globe className="w-4 h-4 text-gray-600"/></div>
                                        <div>
                                            <p className="font-medium text-gray-900">Chrome on Windows</p>
                                            <p className="text-gray-500">{login.ip} • {new Date(login.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">Active now</span>
                                </div>
                            )) || <p className="text-gray-500 text-sm">No login history available.</p>}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'billing' && (
                <div className="max-w-3xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Payment Methods</h3>
                        <button className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add Method
                        </button>
                    </div>
                    
                    <div className="grid gap-4 mb-8">
                        {userProfile?.billingMethods?.length > 0 ? userProfile.billingMethods.map((method, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-100 p-2 rounded-md"><CreditCard className="w-6 h-6 text-gray-600"/></div>
                                    <div>
                                        <p className="font-bold text-gray-900">•••• •••• •••• {method.last4}</p>
                                        <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                                    </div>
                                </div>
                                <button className="text-red-600 text-sm hover:underline">Remove</button>
                            </div>
                        )) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">No payment methods saved.</p>
                            </div>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Billing History</h3>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="text-gray-500 border-b">
                                <th className="py-2">Date</th>
                                <th className="py-2">Description</th>
                                <th className="py-2">Amount</th>
                                <th className="py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {/* Mock Data */}
                            <tr className="border-b">
                                <td className="py-3">Oct 24, 2024</td>
                                <td>Monthly Subscription</td>
                                <td>$19.00</td>
                                <td><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Paid</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
