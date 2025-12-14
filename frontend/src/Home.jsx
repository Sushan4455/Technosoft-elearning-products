import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // New Footer Component
import { getPopularCourses } from './services/courseService';
import { 
  Users, Award, PlayCircle, Star, ChevronRight, ArrowRight, 
  Globe, BookOpen, Code, PenTool, BarChart, Cpu, Camera, Music, 
  TrendingUp, UserCheck, Monitor, ChevronDown, GraduationCap, Calendar, Clock
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Animated Counter Component
const Counter = ({ value, duration = 2 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState("0");

  useEffect(() => {
    if (inView) {
      // Parse value to find suffix (k, +, %, etc.)
      const match = value.match(/^([\d.]+)(.*)$/);
      if (!match) {
          setCount(value);
          return;
      }

      const endValue = parseFloat(match[1]);
      const suffix = match[2];
      const isFloat = match[1].includes('.');
      
      let start = 0;
      const totalMilSec = duration * 1000;
      const stepTime = Math.abs(Math.floor(totalMilSec / (endValue * (isFloat ? 10 : 1)))); 
      
      let timer = setInterval(() => {
        start += isFloat ? 0.1 : 1;
        if (start >= endValue) {
            setCount(String(endValue) + suffix);
            clearInterval(timer);
        } else {
            setCount(
                (isFloat ? start.toFixed(1) : Math.floor(start)) + suffix
            );
        }
      }, stepTime || 10);

      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  return <span ref={ref}>{count}</span>;
};

// Floating Badge Component
const FloatingBadge = ({ icon: Icon, text, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`absolute bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/50 ${className}`}
  >
    <div className="bg-blue-100 p-2 rounded-lg">
      <Icon className="w-5 h-5 text-blue-600" />
    </div>
    <span className="font-bold text-sm text-gray-800">{text}</span>
  </motion.div>
);

// Category Card Component
const CategoryCard = ({ icon: Icon, title, courses, color }) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', group: 'group-hover:bg-blue-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', group: 'group-hover:bg-purple-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', group: 'group-hover:bg-orange-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600', group: 'group-hover:bg-green-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600', group: 'group-hover:bg-red-600' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', group: 'group-hover:bg-pink-600' }
  };

  const styles = colorMap[color] || colorMap.blue;

  return (
    <motion.div 
        whileHover={{ y: -10 }}
        className="group relative bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
        <div className={`w-16 h-16 ${styles.bg} rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${styles.group} group-hover:text-white`}>
          <Icon className={`w-8 h-8 ${styles.text} group-hover:text-white transition-colors duration-300`} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 group-hover:text-gray-700 transition-colors">{courses} Courses</p>
        
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gray-50 rounded-full group-hover:scale-[10] transition-transform duration-500 -z-10 opacity-30"></div>
    </motion.div>
  );
};

// Event Card Component
const EventCard = ({ event }) => {
    // Countdown Logic (simplified)
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const eventTime = new Date(`${event.date}T${event.time}`).getTime();
            const now = Date.now();
            const diff = eventTime - now;

            if (diff <= 0) {
                setTimeLeft("Started");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            setTimeLeft(`${days}d ${hours}h left`);
        }, 1000);
        return () => clearInterval(interval);
    }, [event]);

    return (
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                {event.type || 'Webinar'}
            </div>
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-lg text-gray-900 leading-tight">{event.title}</h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {event.date} • {event.time}
                    </p>
                </div>
            </div>
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-semibold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
                    {timeLeft}
                </span>
                <button className="text-blue-600 font-bold text-sm hover:underline">Register &rarr;</button>
            </div>
        </motion.div>
    );
};

const TestimonialCard = ({ name, role, text, image }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="flex gap-1 mb-6">
      {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
    </div>
    <p className="text-gray-600 mb-8 leading-relaxed text-lg">"{text}"</p>
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500">
        <img src={image} alt={name} className="w-full h-full rounded-full object-cover border-2 border-white" />
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-base">{name}</h4>
        <p className="text-blue-600 text-sm font-medium">{role}</p>
      </div>
    </div>
  </motion.div>
);

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-full p-6 flex items-center justify-between text-left focus:outline-none transition-all rounded-2xl ${isOpen ? 'bg-blue-50' : 'bg-white hover:bg-gray-50 border border-gray-100'}`}
      >
        <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-blue-700' : 'text-gray-900'}`}>
          {question}
        </span>
        <span className={`p-2 rounded-full transition-all ${isOpen ? 'bg-blue-200 text-blue-700 rotate-180' : 'bg-gray-100 text-gray-500'}`}>
          <ChevronDown className="w-5 h-5" />
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-2 text-gray-600 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    viewport={{ once: true }}
    className="relative group p-6"
  >
    <div className="flex flex-col items-center justify-center relative z-10">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-white/10">
          <Icon className="w-8 h-8 text-blue-300" />
        </div>
        <div className="text-5xl font-bold mb-2 text-white tracking-tight">
          <Counter value={value} />
        </div>
        <div className="text-blue-200 font-medium tracking-wide">{label}</div>
    </div>
  </motion.div>
);

const Home = () => {
  const [popularCourses, setPopularCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [events, setEvents] = useState([]);
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 200]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);
  const scaleHero = useTransform(scrollY, [0, 300], [1, 0.9]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoadingCourses(true);
      try {
        const coursesData = await getPopularCourses();
        if (isMounted) setPopularCourses(coursesData || []);

        const eventsRes = await axios.get(`${API_URL}/events`);
        if (isMounted) setEvents(eventsRes.data || []);
      } catch (e) {
        console.error("Failed to fetch data", e);
      } finally {
        if (isMounted) setLoadingCourses(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const categories = [
    { icon: Code, title: "Development", courses: "350+", color: "blue" },
    { icon: PenTool, title: "Design", courses: "120+", color: "purple" },
    { icon: BarChart, title: "Business", courses: "200+", color: "orange" },
    { icon: Cpu, title: "IT & Software", courses: "150+", color: "green" },
    { icon: Music, title: "Music", courses: "80+", color: "red" },
    { icon: Camera, title: "Photography", courses: "90+", color: "pink" },
  ];

  const partners = [
    { name: "Google", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png" },
    { name: "Microsoft", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/1280px-Microsoft_logo_%282012%29.svg.png" },
    { name: "Spotify", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png" },
    { name: "Amazon", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png" },
    { name: "Netflix", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png" },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "UX Designer @ Google",
      text: "This platform completely transformed my career. The courses are well-structured and the mentors are incredibly helpful. I went from zero to hired in 6 months.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      name: "Michael Chen",
      role: "Frontend Dev @ Amazon",
      text: "The best investment I've made for my education. The community aspect is what sets it apart - learning together makes a huge difference.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
    },
    {
      name: "Emily Davis",
      role: "Product Manager @ Spotify",
      text: "High quality content that is constantly updated. I use it to keep my skills sharp and stay ahead of industry trends.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
    }
  ];

  const faqs = [
    { question: "How do I get access to the courses?", answer: "Once you sign up, you can browse our catalog and enroll in any course. We also offer a premium subscription for unlimited access to all content." },
    { question: "Can I download videos for offline viewing?", answer: "Yes! Our mobile app allows you to download course content so you can learn on the go, even without an internet connection." },
    { question: "Do you offer certificates upon completion?", answer: "Absolutely. Every course you complete comes with a verified certificate that you can share on your LinkedIn profile or resume." },
    { question: "Is there a refund policy?", answer: "We offer a 30-day money-back guarantee. If you're not satisfied with a course, simply request a refund within 30 days of purchase." }
  ];

  const stats = [
    { icon: UserCheck, label: "Active Students", value: "50k+" },
    { icon: BookOpen, label: "Total Courses", value: "1200+" },
    { icon: GraduationCap, label: "Instructors", value: "300+" },
    { icon: TrendingUp, label: "Course Rating", value: "4.8" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      {/* Modern Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white rounded-b-[4rem]">
         {/* Animated Background Gradients */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-gradient-to-br from-blue-100/40 to-cyan-100/40 rounded-full blur-[100px] animate-blob"></div>
             <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-gradient-to-bl from-purple-100/40 to-pink-100/40 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
             <div className="absolute -bottom-[20%] left-[20%] w-[700px] h-[700px] bg-gradient-to-t from-yellow-100/40 to-orange-100/40 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
         </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
             <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6 }}
                 className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-10 cursor-pointer hover:border-blue-300 transition-colors group"
             >
                 <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                 <span className="text-sm font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">
                     Unlock your potential with AI-driven learning
                 </span>
                 <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
             </motion.div>

             <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, delay: 0.1 }}
                 className="text-6xl md:text-8xl font-bold tracking-tight text-gray-900 mb-8 leading-[0.9]"
             >
                 Learn without <br className="hidden md:block"/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">limits.</span>
             </motion.h1>

             <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, delay: 0.2 }}
                 className="text-xl md:text-2xl text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed"
             >
                 Join 50,000+ students mastering the skills of the future. From coding to design, get the expertise you need to thrive.
             </motion.p>

             <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, delay: 0.3 }}
                 className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
             >
                 <Link to="/signup" className="w-full sm:w-auto px-10 py-5 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 group">
                     Start Learning Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </Link>
                 <Link to="/courses" className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                     <PlayCircle className="w-5 h-5" /> View Courses
                 </Link>
             </motion.div>

             {/* 3D Dashboard Preview with Scroll Parallax */}
             <motion.div 
                 style={{ y: yHero, opacity: opacityHero, scale: scaleHero }}
                 initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                 animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                 transition={{ duration: 1.2, delay: 0.4, type: "spring", stiffness: 100 }}
                 className="relative max-w-6xl mx-auto perspective-1000"
             >
                 <div className="bg-gray-900 rounded-3xl p-3 shadow-2xl border border-gray-800/50 backdrop-blur-sm ring-1 ring-white/10">
                     <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700/50 aspect-[16/9] relative group">
                         {/* Header Mock */}
                         <div className="h-10 bg-gray-900 border-b border-gray-700 flex items-center px-6 gap-3">
                             <div className="flex gap-2">
                                 <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                 <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                 <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                             </div>
                             <div className="flex-1 flex justify-center">
                               <div className="bg-gray-800 px-4 py-1 rounded-full text-xs text-gray-500 font-mono">edupro.com/dashboard</div>
                             </div>
                         </div>
                         
                         {/* Dashboard Content Mock */}
                         <div className="p-8 grid grid-cols-12 gap-8 h-full bg-gray-900">
                             {/* Sidebar */}
                             <div className="col-span-2 hidden lg:flex flex-col gap-4">
                               <div className="w-10 h-10 bg-blue-600 rounded-xl mb-4"></div>
                               {[1,2,3,4].map(i => <div key={i} className="w-full h-2 bg-gray-700 rounded-full opacity-50"></div>)}
                             </div>
                             
                             {/* Main Content */}
                             <div className="col-span-12 lg:col-span-10 grid grid-cols-3 gap-6">
                                <div className="col-span-2 bg-gray-800 rounded-2xl p-6 border border-gray-700">
                                   <div className="flex justify-between items-center mb-8">
                                     <div className="w-32 h-4 bg-gray-700 rounded-full"></div>
                                     <div className="flex gap-2">
                                       <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                                       <div className="w-8 h-8 rounded-full bg-blue-600/50 border border-blue-500"></div>
                                     </div>
                                   </div>
                                   <div className="flex items-end gap-2 h-32">
                                      {[40, 60, 45, 70, 50, 80, 65, 90, 75].map((h, i) => (
                                        <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }}></div>
                                      ))}
                                   </div>
                                </div>
                                <div className="col-span-1 bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col justify-between">
                                   <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                                     <TrendingUp />
                                   </div>
                                   <div>
                                     <div className="text-3xl font-bold text-white mb-1">+124%</div>
                                     <div className="text-gray-500 text-sm">Learning Progress</div>
                                   </div>
                                </div>
                                <div className="col-span-3 bg-gray-800 rounded-2xl p-6 border border-gray-700 h-40 flex items-center justify-center relative overflow-hidden group/card">
                                   <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-purple-900/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                                   <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover/card:scale-110 transition-transform duration-300" />
                                </div>
                             </div>
                         </div>
                         
                         {/* Floating badges */}
                         <FloatingBadge icon={Users} text="50k+ Students" className="top-32 -left-8 hidden xl:flex rotate-[-6deg]" delay={0.6} />
                         <FloatingBadge icon={Award} text="Certified" className="bottom-24 -right-8 hidden xl:flex rotate-[6deg]" delay={0.8} />
                     </div>
                 </div>
             </motion.div>
         </div>
      </section>

      {/* Trusted By Marquee */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">Trusted by leading companies</p>
            <div className="flex flex-wrap justify-center items-center gap-16 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                {partners.map((partner, idx) => (
                   <img key={idx} src={partner.url} alt={partner.name} className="h-8 md:h-12 object-contain filter" />
                ))}
            </div>
        </div>
      </section>

      {/* Stats Section with Dark Gradient */}
      <section className="bg-gray-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <StatCard key={i} index={i} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section (NEW) */}
      {events.length > 0 && (
          <section className="py-24 bg-blue-50/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center mb-12">
                      <h2 className="text-4xl font-bold text-gray-900">Upcoming Events</h2>
                      <Link to="/events" className="text-blue-600 font-bold hover:underline">View All</Link>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                      {events.slice(0, 3).map((event, i) => (
                          <EventCard key={i} event={event} />
                      ))}
                  </div>
              </div>
          </section>
      )}

      {/* Popular Courses Carousel */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Courses</h2>
              <p className="text-xl text-gray-500">Explore our highest-rated courses, designed for real-world skills.</p>
            </div>
            <Link to="/courses" className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-all flex items-center gap-2 group whitespace-nowrap shadow-sm hover:shadow-md">
              View All Courses <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loadingCourses ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-[2rem] p-4 h-[450px]">
                  <div className="h-56 bg-gray-100 rounded-2xl mb-6"></div>
                  <div className="h-6 bg-gray-100 w-3/4 mb-3 rounded"></div>
                  <div className="h-4 bg-gray-100 w-1/2 rounded"></div>
                </div>
              ))
            ) : (
              popularCourses.slice(0, 3).map((course, idx) => (
                <Link to={`/courses/${course.id}`} key={idx} className="group h-full">
                  <div className="bg-white rounded-[2rem] border border-gray-100 p-3 shadow-sm hover:shadow-2xl hover:border-blue-100 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                    <div className="relative h-60 overflow-hidden rounded-2xl mb-6">
                       <img src={course.image} alt={course.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"/>
                       <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                       <div className="absolute top-4 left-4">
                         <span className="bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm text-gray-900 uppercase tracking-wide">
                            {course.category}
                         </span>
                       </div>
                    </div>
                    <div className="px-4 pb-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3 text-sm">
                         <span className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 px-2 py-1 rounded-md">
                           <Star className="w-3 h-3 fill-current" /> 4.9
                         </span>
                         <span className="text-gray-400">•</span>
                         <span className="text-gray-500">2.5k reviews</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                        {course.title}
                      </h3>
                      <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden ring-2 ring-white">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.id}`} alt="Instructor" />
                           </div>
                           <div className="text-sm">
                             <p className="text-gray-900 font-bold">Dr. Angela</p>
                             <p className="text-gray-500 text-xs">Instructor</p>
                           </div>
                         </div>
                         <div className="text-xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                           {course.price}
                         </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid (Bento) */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="max-w-3xl mb-20">
             <h2 className="text-5xl font-bold text-gray-900 mb-6">Why we are different</h2>
             <p className="text-xl text-gray-500 leading-relaxed">We don't just provide courses; we provide a complete ecosystem for your growth. From interactive tools to global networking.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-[350px]">
              
              {/* Feature 1 */}
              <div className="md:col-span-4 bg-gray-50 rounded-[2.5rem] p-10 relative overflow-hidden group border border-gray-100 hover:border-blue-100 transition-colors">
                 <div className="relative z-10 max-w-lg">
                   <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200">
                     <Monitor className="w-7 h-7" />
                   </div>
                   <h3 className="text-3xl font-bold mb-4">Hands-on Coding Labs</h3>
                   <p className="text-gray-600 text-lg">Forget passive watching. Write code, build projects, and get instant feedback right in your browser with our advanced IDE.</p>
                 </div>
                 
                 <div className="absolute right-0 bottom-0 w-[500px] h-[300px] bg-white rounded-tl-3xl shadow-2xl translate-x-12 translate-y-12 border border-gray-200 p-4 group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-500">
                   <div className="w-full h-full bg-gray-900 rounded-xl p-4 font-mono text-sm">
                      <div className="flex gap-1.5 mb-4">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-green-400"><span className="text-purple-400">function</span> <span className="text-blue-400">learn</span>() {'{'}</div>
                      <div className="pl-4 text-gray-300">const skill = <span className="text-orange-400">"React"</span>;</div>
                      <div className="pl-4 text-gray-300">return <span className="text-yellow-400">true</span>;</div>
                      <div className="text-green-400">{'}'}</div>
                   </div>
                 </div>
              </div>

              {/* Feature 2 */}
              <div className="md:col-span-2 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                 <div className="relative z-10">
                   <Users className="w-12 h-12 mb-8 opacity-80" />
                   <h3 className="text-3xl font-bold mb-4">Community</h3>
                   <p className="text-purple-100 text-lg">Connect with millions of learners worldwide.</p>
                 </div>
                 <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              </div>

              {/* Feature 3 */}
              <div className="md:col-span-2 bg-gray-900 text-white rounded-[2.5rem] p-10 relative overflow-hidden group">
                 <div className="relative z-10">
                   <Award className="w-12 h-12 mb-8 text-yellow-400" />
                   <h3 className="text-3xl font-bold mb-4">Certification</h3>
                   <p className="text-gray-400 text-lg">Earn recognized certificates for every course.</p>
                 </div>
                 <Award className="absolute -bottom-4 -right-4 w-40 h-40 text-white/5 transform group-hover:rotate-12 transition-transform duration-500" />
              </div>

              {/* Feature 4 */}
              <div className="md:col-span-4 bg-blue-50 rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-100">
                  <div className="relative z-10 max-w-xl">
                     <h3 className="text-3xl font-bold mb-4 text-gray-900">Expert Mentorship</h3>
                     <p className="text-gray-600 text-lg mb-8">Get 1-on-1 guidance from industry veterans who have worked at top tech companies.</p>
                     <Link to="/mentors" className="inline-flex items-center gap-2 font-bold text-blue-700 hover:text-blue-900 transition-colors">
                       Find a Mentor <ArrowRight className="w-5 h-5" />
                     </Link>
                  </div>
                  <div className="relative flex-shrink-0">
                    <div className="flex -space-x-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=mentor${i}`} alt="Mentor" className="w-full h-full bg-gray-100" />
                        </div>
                      ))}
                      <div className="w-16 h-16 rounded-full border-4 border-white bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg relative z-10">
                        +50
                      </div>
                    </div>
                  </div>
              </div>

           </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Top Categories</h2>
            <p className="text-xl text-gray-500">Explore our most popular learning paths</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, idx) => (
              <CategoryCard key={idx} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by students</h2>
                  <p className="text-xl text-gray-500 max-w-2xl mx-auto">Don't just take our word for it. Here is what our community has to say.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                  {testimonials.map((t, idx) => (
                      <TestimonialCard key={idx} {...t} />
                  ))}
              </div>
          </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
              <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                      <FaqItem key={idx} {...faq} />
                  ))}
              </div>
          </div>
      </section>

      {/* Newsletter / CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden text-center shadow-2xl shadow-blue-200">
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[100px] opacity-60 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[100px] opacity-60 -ml-20 -mb-20"></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
             </div>
             
             <div className="relative z-10 max-w-4xl mx-auto">
               <h2 className="text-4xl lg:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
                 Ready to start your journey?
               </h2>
               <p className="text-blue-100 text-xl lg:text-2xl mb-12 leading-relaxed max-w-2xl mx-auto">
                 Join thousands of learners from around the world. Get unlimited access to 25,000+ top courses.
               </p>
               
               <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                 <Link to="/signup" className="w-full sm:w-auto px-12 py-5 bg-white text-blue-600 rounded-full font-bold text-xl hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                   Get Started for Free
                 </Link>
               </div>
               <p className="text-blue-200/80 text-sm mt-8 font-medium tracking-wide uppercase">No credit card required for free trial</p>
             </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
