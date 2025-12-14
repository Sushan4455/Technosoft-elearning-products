import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Mail, Key, ArrowRight, CheckCircle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Simulate backend call
    setTimeout(() => {
        console.log(`OTP sent to ${email}: 123456`); // Mock OTP
        setLoading(false);
        setStep(2);
    }, 1500);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const code = otp.join('');
    // Simulate verification
    setTimeout(() => {
        if (code === '123456') {
            setLoading(false);
            setStep(3);
        } else {
            setLoading(false);
            setError('Invalid OTP code. Please try again.');
        }
    }, 1500);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
    }
    setLoading(true);
    setError('');
    // Simulate password update
    setTimeout(() => {
        setLoading(false);
        alert('Password reset successfully!');
        navigate('/login');
    }, 1500);
  };

  const handleOtpChange = (index, value) => {
      if (isNaN(value)) return;
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Auto focus next input
      if (value && index < 5) {
          document.getElementById(`otp-${index + 1}`).focus();
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
            <div className="flex justify-center mb-6">
                <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/20">
                    <Key className="w-8 h-8 text-white" />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify OTP' : 'Reset Password'}
            </h2>
            <p className="text-center text-gray-500 mb-8 text-sm">
                {step === 1 ? 'Enter your email to receive a verification code.' : step === 2 ? `We sent a code to ${email}` : 'Create a new secure password.'}
            </p>

            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
                    {error}
                </div>
            )}

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.form 
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleSendOtp} 
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input 
                                    type="email" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? 'Sending...' : <>Send Code <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </motion.form>
                )}

                {step === 2 && (
                    <motion.form 
                        key="step2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleVerifyOtp} 
                        className="space-y-6"
                    >
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, idx) => (
                                <input 
                                    key={idx}
                                    id={`otp-${idx}`}
                                    type="text" 
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            ))}
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? 'Verifying...' : 'Verify & Proceed'}
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-gray-700">Change Email</button>
                    </motion.form>
                )}

                {step === 3 && (
                    <motion.form 
                        key="step3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleResetPassword} 
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input 
                                    type="password" 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input 
                                    type="password" 
                                    required 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? 'Updating...' : <>Reset Password <CheckCircle className="w-4 h-4" /></>}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="mt-8 text-center border-t border-gray-100 pt-6">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1">
                    &larr; Back to Login
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
