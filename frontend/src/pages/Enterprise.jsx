import React from 'react';
import Navbar from '../components/Navbar';
import { CheckCircle, Zap, Globe, Users, Building, ArrowRight, BarChart, Shield, Layout } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
  >
    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
        <Icon className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors duration-300" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const StatCard = ({ value, label }) => (
    <div className="text-center">
        <div className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-2">{value}</div>
        <div className="text-gray-600 font-medium uppercase tracking-wide text-sm">{label}</div>
    </div>
);

const Enterprise = () => {
  return (
    <div className="bg-white min-h-screen font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90"></div>
            <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1932&q=80" alt="Meeting" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="bg-blue-500/20 text-blue-200 text-sm font-bold px-4 py-1.5 rounded-full border border-blue-500/30 uppercase tracking-wider mb-6 inline-block">
                        EduPro for Business
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Empower your team with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">world-class skills.</span>
                    </h1>
                    <p className="text-xl text-gray-300 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
                        Upskill your workforce with unlimited access to 25,000+ top-rated courses. Drive innovation and retention with the world's leading learning platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/30 flex items-center justify-center gap-2">
                            Request a Demo <ArrowRight className="w-5 h-5" />
                        </button>
                        <button className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
                            View Pricing
                        </button>
                    </div>
                </motion.div>
            </div>
            {/* Abstract Graphic Right */}
            <div className="md:w-1/2 relative hidden md:block">
               {/* Could add a floating dashboard mock here using framer-motion if desired */}
            </div>
        </div>
      </div>

      {/* Trusted By */}
      <div className="py-10 border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Trusted by industry leaders</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {['Google', 'Samsung', 'CocaCola', 'Volkswagen', 'Spotify'].map((brand, i) => (
                   <span key={i} className="text-2xl font-bold text-gray-800">{brand}</span> 
                   // Ideally use SVG logos here
               ))}
            </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <StatCard value="15k+" label="Enterprise Customers" />
                <StatCard value="25k+" label="Expert-led Courses" />
                <StatCard value="100+" label="Countries" />
                <StatCard value="98%" label="Satisfaction Rate" />
            </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why choose EduPro Business?</h2>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">We provide the tools and content you need to transform your organization's skills.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={Zap} 
                    title="Fast Implementation" 
                    description="Deploy our learning platform to your entire organization in days, not months. SSO integration included."
                    delay={0.1}
                />
                <FeatureCard 
                    icon={Globe} 
                    title="Global Content" 
                    description="Courses available in 15+ languages to support your distributed teams worldwide."
                    delay={0.2}
                />
                <FeatureCard 
                    icon={Building} 
                    title="Scalable Solution" 
                    description="From startups to Fortune 500s, our platform grows with your needs. Volume licensing available."
                    delay={0.3}
                />
                <FeatureCard 
                    icon={BarChart} 
                    title="Advanced Analytics" 
                    description="Track learner progress, skills acquisition, and ROI with our comprehensive dashboard."
                    delay={0.4}
                />
                <FeatureCard 
                    icon={Shield} 
                    title="Enterprise Security" 
                    description="SOC2 Type II compliant, GDPR ready, and end-to-end encryption for your data."
                    delay={0.5}
                />
                <FeatureCard 
                    icon={Layout} 
                    title="Custom Learning Paths" 
                    description="Curate content to match your specific roles and career ladders."
                    delay={0.6}
                />
            </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-600 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
                
                <div className="relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to transform your workforce?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Join thousands of forward-thinking companies that use EduPro to drive business results.</p>
                    <Link to="/contact" className="bg-white text-blue-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-block">
                        Contact Sales
                    </Link>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default Enterprise;
