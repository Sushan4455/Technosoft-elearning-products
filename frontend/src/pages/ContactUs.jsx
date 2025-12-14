import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Mail, MapPin, Phone, Send, HelpCircle, Globe as GlobeIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactItem = ({ icon: Icon, title, content, subContent }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
    <div className="bg-blue-500/20 p-3 rounded-lg">
      <Icon className="w-6 h-6 text-blue-300" />
    </div>
    <div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-blue-100">{content}</p>
      {subContent && <p className="text-blue-200/60 text-sm mt-1">{subContent}</p>}
    </div>
  </div>
);

const FaqItem = ({ question, answer }) => (
    <div className="border-b border-gray-100 py-4 last:border-0">
        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" /> {question}
        </h4>
        <p className="text-gray-600 text-sm pl-6">{answer}</p>
    </div>
);

const ContactUs = () => {
  const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      subject: 'General Inquiry',
      message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          const response = await fetch('http://localhost:5000/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  name: `${formData.firstName} ${formData.lastName}`,
                  email: formData.email,
                  message: `${formData.subject}: ${formData.message}`
              })
          });
          
          if (response.ok) {
              alert("Message sent successfully!");
              setFormData({ firstName: '', lastName: '', email: '', subject: 'General Inquiry', message: '' });
          } else {
              alert("Failed to send message.");
          }
      } catch (error) {
          alert("Error sending message.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      {/* Header / Background */}
      <div className="bg-gray-900 pt-20 pb-32 lg:pb-40 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
                Get in Touch
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-400 max-w-2xl mx-auto"
            >
                Have questions about our courses, enterprise solutions, or just want to say hello? We'd love to hear from you.
            </motion.p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-20 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Panel: Contact Info */}
          <div className="lg:w-5/12 bg-gray-900 text-white p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600/10 opacity-50 pattern-grid-lg"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
              <p className="text-gray-400 mb-8">Fill up the form and our Team will get back to you within 24 hours.</p>
              
              <div className="space-y-6">
                <ContactItem 
                    icon={Phone} 
                    title="Phone" 
                    content="+1 (555) 123-4567" 
                    subContent="Mon-Fri, 9am-6pm EST"
                />
                <ContactItem 
                    icon={Mail} 
                    title="Email" 
                    content="karkisush1470@gmail.com" 
                    subContent="For general inquiries"
                />
                <ContactItem 
                    icon={MapPin} 
                    title="Office" 
                    content="123 Learning Ave, Suite 100" 
                    subContent="San Francisco, CA 94107"
                />
              </div>
            </div>

            <div className="relative z-10 mt-12">
               <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Follow us</p>
               <div className="flex gap-4">
                 {['twitter', 'linkedin', 'instagram', 'facebook'].map((social) => (
                     <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                         <span className="sr-only">{social}</span>
                         <GlobeIcon className="w-4 h-4 text-white" />
                     </a>
                 ))}
               </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="lg:w-7/12 p-10 lg:p-12 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Doe" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="john@example.com" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Subject</label>
                <select name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-600">
                  <option>General Inquiry</option>
                  <option>Support Request</option>
                  <option>Enterprise Solutions</option>
                  <option>Careers</option>
                  <option>Press / Media</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows="5" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none" placeholder="Tell us how we can help..." required></textarea>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                <Send className="w-5 h-5" /> {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

        </div>

        {/* FAQ Section (Bottom) */}
        <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <FaqItem question="What is the response time?" answer="We typically respond to all inquiries within 24 business hours." />
                <FaqItem question="Do you offer phone support?" answer="Yes, our enterprise customers have access to 24/7 dedicated phone support." />
                <FaqItem question="Where are you located?" answer="Our headquarters are in San Francisco, but we are a remote-first company with team members globally." />
            </div>
        </div>

      </div>
    </div>
  );
};

export default ContactUs;
