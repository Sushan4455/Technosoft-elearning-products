import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <div className="bg-blue-600 p-2.5 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">EduPro</span>
              </div>
              <p className="text-gray-500 leading-relaxed mb-8 max-w-sm text-lg">
                Empowering learners worldwide with accessible, high-quality education. We believe everyone has the right to learn.
              </p>
              <div className="flex gap-4">
                 {['twitter', 'facebook', 'linkedin', 'instagram'].map(social => (
                   <a key={social} href="#" className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300">
                     <span className="sr-only">{social}</span>
                     <Globe className="w-5 h-5" />
                   </a>
                 ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-lg">Learn</h4>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li><Link to="/courses" className="hover:text-blue-600 transition-colors">All Courses</Link></li>
                <li><Link to="/mentors" className="hover:text-blue-600 transition-colors">Mentorship</Link></li>
                <li><Link to="/enterprise" className="hover:text-blue-600 transition-colors">Enterprise</Link></li>
                <li><Link to="/courses" className="hover:text-blue-600 transition-colors">Certificates</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-lg">Company</h4>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li><a href="#" className="hover:text-blue-600 transition-colors">About Us</a></li>
                <li><Link to="/careers" className="hover:text-blue-600 transition-colors">Careers</Link></li>
                <li><Link to="/blogs" className="hover:text-blue-600 transition-colors">Blog</Link></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Press</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-lg">Support</h4>
              <ul className="space-y-4 text-gray-500 font-medium">
                <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Cookie Settings</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 font-medium">© 2024 EduPro Inc. All rights reserved.</p>
            <div className="flex gap-8 text-gray-400 font-medium">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
    </footer>
  );
};

export default Footer;
