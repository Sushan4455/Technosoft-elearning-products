import React, { useState } from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Upload, CheckCircle, CreditCard, Copy, AlertCircle, ArrowLeft } from 'lucide-react';
import { uploadToS3 } from '../services/uploadService';
import { createEnrollment } from '../services/enrollmentService';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const course = location.state?.course;
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [, setScreenshotUrl] = useState('');

  // Payment Details
  const bankDetails = {
    bankName: "Nabil Bank",
    accountNumber: "03410017519222",
    accountName: "Sushan Karki"
  };

  const esewaDetails = {
    id: "9864059619",
    name: "Sushan Karki"
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !currentUser || !course) return;

    setUploading(true);
    try {
      // Upload with structure: payments/{studentId}/screenshots/
      const { key } = await uploadToS3(file, `payments/${currentUser.uid}/screenshots`);
      setScreenshotUrl(key);
      
      await createEnrollment(
          currentUser.uid, 
          course.id, 
          course.mentorId || 'unknown_mentor', 
          key,
          currentUser.displayName || currentUser.email,
          course.title,
          course.price
      );

      setSuccess(true);
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to submit payment. Please try again. " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <div className="max-w-md mx-auto mt-32 px-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-2xl shadow-xl text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Submitted!</h2>
            <p className="text-gray-600 mb-8">
              Thank you for your payment. We will verify your screenshot and activate your course shortly. You will receive an email confirmation.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="max-w-4xl mx-auto pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Payment Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
              <p className="text-gray-500">
                {course ? `Enrolling in: ${course.title}` : 'Please complete your payment below.'}
              </p>
            </div>

            {/* Price Card */}
            {course && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Course Price</span>
                  <span className="text-xl font-bold text-gray-900">{course.price}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total to Pay</span>
                  <span className="text-2xl font-bold text-blue-600">{course.price}</span>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Bank Transfer
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Bank Name</span>
                  <span className="font-medium text-gray-900">{bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Account Name</span>
                  <span className="font-medium text-gray-900">{bankDetails.accountName}</span>
                </div>
                <div className="flex justify-between items-center group cursor-pointer" onClick={() => copyToClipboard(bankDetails.accountNumber)}>
                  <span className="text-sm text-gray-500">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{bankDetails.accountNumber}</span>
                    <Copy className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                 <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                   <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">e</span>
                   eSewa Payment
                 </h3>
                 <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">eSewa ID</span>
                      <div className="flex items-center gap-2 cursor-pointer group" onClick={() => copyToClipboard(esewaDetails.id)}>
                        <span className="font-medium text-gray-900">{esewaDetails.id}</span>
                        <Copy className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Name</span>
                      <span className="font-medium text-gray-900">{esewaDetails.name}</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column: QR Code & Upload */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
              <h3 className="font-bold text-gray-900 mb-4">Scan to Pay</h3>
              <div className="bg-gray-100 p-4 rounded-xl inline-block mb-4">
                 {/* QR Code Image */}
                 <img src="/payment-qr.jpeg" alt="Payment QR Code" className="w-48 h-48 object-cover rounded-lg" />
              </div>
              <p className="text-sm text-gray-500">Scan this QR code with your banking app or eSewa to pay instantly.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload Payment Screenshot
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-500 transition-colors relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                      <CheckCircle className="w-5 h-5" />
                      {file.name}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700">
                    Please ensure the transaction ID and amount are clearly visible in the screenshot.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={!file || uploading}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                    !file || uploading 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30'
                  }`}
                >
                  {uploading ? 'Verifying...' : 'Verify Payment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
