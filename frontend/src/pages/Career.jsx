import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // Added Footer
import { Briefcase, MapPin, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const JobCard = ({ id, title, type, location, description, onApply }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full"
  >
    <div>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-500 text-sm">{description && description.substring(0, 100)}...</p>
        </div>
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">{type}</span>
      </div>
      
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
        <div className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {location}</div>
        <div className="flex items-center gap-1"><Clock className="w-4 h-4"/> Posted recently</div>
      </div>
    </div>
    
    <button onClick={() => onApply(id)} className="w-full py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors mt-auto">
      View Details & Apply
    </button>
  </motion.div>
);

const BenefitCard = ({ title, description }) => (
  <div className="flex gap-4">
    <div className="bg-green-100 p-2 rounded-lg h-fit">
      <CheckCircle className="w-6 h-6 text-green-600" />
    </div>
    <div>
      <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

const Career = () => {
  const [jobs, setJobs] = useState([]);
  const [applyingJob, setApplyingJob] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', cvUrl: '' }); // Mock CV upload

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${API_URL}/careers`);
        setJobs(res.data || []);
      } catch (e) {
        console.error("Failed to fetch jobs");
      }
    };
    fetchJobs();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_URL}/careers/apply`, { ...formData, jobId: applyingJob });
        alert("Application Submitted!");
        setApplyingJob(null);
        setFormData({ name: '', email: '', phone: '', cvUrl: '' });
    } catch (error) {
        alert("Failed to submit");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar />
      
      {/* Hero */}
      <div className="bg-gray-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Join our mission to <br/> <span className="text-blue-400">democratize education</span>
          </motion.h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            We're looking for passionate individuals who want to make a difference in how the world learns. Build the future of education with us.
          </p>
          <a href="#positions" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors">
            View Open Positions
          </a>
        </div>
      </div>

      {/* Values/Benefits */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why work with us?</h2>
            <p className="text-gray-500">We take care of our team so they can take care of our students.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <BenefitCard title="Remote-First" description="Work from anywhere in the world. We believe in output, not hours in a chair." />
            <BenefitCard title="Competitive Pay" description="We offer top-tier salaries and equity packages to all employees." />
            <BenefitCard title="Unlimited Learning" description="Free access to all courses on our platform and a yearly learning stipend." />
            <BenefitCard title="Health & Wellness" description="Comprehensive health insurance and wellness programs for you and your family." />
            <BenefitCard title="Team Retreats" description="Twice a year, we fly everyone to an exotic location for a week of bonding and fun." />
            <BenefitCard title="Home Office Setup" description="$1,000 allowance to set up your perfect home office environment." />
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div id="positions" className="py-24 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Open Positions</h2>
          
          {jobs.length === 0 ? (
             <div className="text-center text-gray-500 py-10">No positions currently open. Check back later!</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
                {jobs.map((job, idx) => (
                <JobCard key={idx} {...job} onApply={setApplyingJob} />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {applyingJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-8 max-w-md w-full">
                  <h3 className="text-2xl font-bold mb-4">Apply for Position</h3>
                  <form onSubmit={handleApply} className="space-y-4">
                      <input type="text" placeholder="Full Name" required className="w-full px-4 py-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      <input type="email" placeholder="Email" required className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      <input type="tel" placeholder="Phone" required className="w-full px-4 py-2 border rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                      {/* Simple URL input for CV for now */}
                      <input type="url" placeholder="Link to CV/Portfolio" className="w-full px-4 py-2 border rounded-lg" value={formData.cvUrl} onChange={e => setFormData({...formData, cvUrl: e.target.value})} />
                      
                      <div className="flex gap-4 mt-6">
                          <button type="button" onClick={() => setApplyingJob(null)} className="w-1/2 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                          <button type="submit" className="w-1/2 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Submit</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      <Footer />
    </div>
  );
};

export default Career;
