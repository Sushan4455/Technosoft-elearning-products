import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMentorAuth } from '../../context/MentorAuthContext';
import { uploadToR2 } from '../../services/uploadService';
import { BookOpen, AlertCircle, LayoutDashboard, UploadCloud, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const MentorSignup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      phone: '',
      country: '',
      address: '',
      field: '',
  });
  const [files, setFiles] = useState({
      idCard: null,
      skillProof: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useMentorAuth();

  const handleFileChange = (e, type) => {
      const file = e.target.files[0];
      if (file) {
          setFiles(prev => ({ ...prev, [type]: file }));
      }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
        // 1. Upload Documents
        let idCardKey = null;
        let skillProofKey = null;

        if (files.idCard) {
            const upload = await uploadToR2(files.idCard, 'verification/id_cards');
            idCardKey = upload.key;
        }
        if (files.skillProof) {
            const upload = await uploadToR2(files.skillProof, 'verification/skills');
            skillProofKey = upload.key;
        }

        // 2. Register Mentor
        await signup(formData.email, formData.password, formData.name, formData.phone, {
            country: formData.country,
            address: formData.address,
            field: formData.field,
            idCardKey,
            skillProofKey,
            status: 'pending' // Enforce pending status
        });

        // 3. Redirect to Pending/Dashboard
        // Ideally show a "Wait for approval" screen, but dashboard with limited access works too
        navigate('/mentor/dashboard'); 
        alert("Registration successful! Your account is pending verification by an admin.");
    } catch (err) {
        console.error(err);
        setError('Failed to create mentor account. ' + err.message);
    } finally {
        setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700"
      >
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/20">
                <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white text-center mb-2">Join as Mentor</h2>
          <p className="text-gray-400 text-center mb-8">Step {step} of 2: {step === 1 ? 'Personal Details' : 'Professional Verification'}</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            {step === 1 ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                            <input type="text" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">City/Address</label>
                            <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600" required />
                        </div>
                    </div>
                    <button type="button" onClick={nextStep} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all">Next Step</button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Teaching Field</label>
                        <select value={formData.field} onChange={(e) => setFormData({...formData, field: e.target.value})} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-600" required>
                            <option value="">Select Field</option>
                            <option value="Development">Development</option>
                            <option value="Design">Design</option>
                            <option value="Business">Business</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                            <UploadCloud className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-300 font-medium mb-1">Upload ID Verification</p>
                            <p className="text-gray-500 text-xs mb-4">Citizenship or National ID Card</p>
                            <input type="file" onChange={(e) => handleFileChange(e, 'idCard')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" required />
                            {files.idCard && <p className="text-green-400 text-xs mt-2 flex items-center justify-center gap-1"><FileText className="w-3 h-3"/> {files.idCard.name}</p>}
                        </div>

                        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                            <UploadCloud className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-300 font-medium mb-1">Upload Skill Proof</p>
                            <p className="text-gray-500 text-xs mb-4">Degree, Certificates, or Portfolio</p>
                            <input type="file" onChange={(e) => handleFileChange(e, 'skillProof')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" required />
                            {files.skillProof && <p className="text-green-400 text-xs mt-2 flex items-center justify-center gap-1"><FileText className="w-3 h-3"/> {files.skillProof.name}</p>}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={prevStep} className="w-1/3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-all">Back</button>
                        <button type="submit" disabled={loading} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center">
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Submit Application"}
                        </button>
                    </div>
                </div>
            )}
          </form>

          <div className="mt-8 text-center">
            <Link to="/mentor/login" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
              Already a mentor? Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MentorSignup;
