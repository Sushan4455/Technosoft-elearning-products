import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MentorAuthProvider, useMentorAuth } from './context/MentorAuthContext'; // Import Mentor Auth
import Home from './Home';
import Login from './Login';
import SignUp from './pages/SignUp';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Mentors from './pages/Mentors';
import Enterprise from './pages/Enterprise';
import MyLearning from './pages/MyLearning';
import Profile from './pages/Profile';
import AccountSettings from './pages/AccountSettings';
import CoursePlayer from './pages/CoursePlayer';
import Career from './pages/Career';
import Blog from './pages/Blog';
import BlogDetails from './pages/BlogDetails';
import ContactUs from './pages/ContactUs';
import Payment from './pages/Payment';
import Chat from './pages/Chat';
import AIAssistant from './components/AIAssistant';
import ForgotPassword from './pages/ForgotPassword';

// Mentor Pages
import MentorLogin from './pages/mentor/MentorLogin';
import MentorSignup from './pages/mentor/MentorSignup';
import MentorLayout from './layouts/MentorLayout';
import Dashboard from './pages/mentor/Dashboard';
import MyCourses from './pages/mentor/MyCourses';
import UploadCourse from './pages/mentor/UploadCourse';
import UploadVideos from './pages/mentor/UploadVideos';
import Assignments from './pages/mentor/Assignments';
import QuizBuilder from './pages/mentor/QuizBuilder';
import StudentsAnalytics from './pages/mentor/StudentsAnalytics';
import MentorSettings from './pages/mentor/MentorSettings';
import PaymentVerification from './pages/mentor/PaymentVerification';
import BlogManager from './pages/mentor/BlogManager';
import BlogEditor from './pages/mentor/BlogEditor';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFinancials from './pages/admin/AdminFinancials';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMentorVerification from './pages/admin/AdminMentorVerification';
import AdminEvents from './pages/admin/AdminEvents';
import AdminCareers from './pages/admin/AdminCareers';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Protected Route Component (Student)
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Mentor Protected Route (Using MentorAuthContext)
const MentorProtectedRoute = ({ children }) => {
    const { currentMentor, loading } = useMentorAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!currentMentor) {
        return <Navigate to="/mentor/login" />;
    }

    return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <MentorAuthProvider>
          <AdminAuthProvider>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/enterprise" element={<Enterprise />} />
            <Route path="/career" element={<Career />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetails />} />
            <Route path="/contact" element={<ContactUs />} />
            
            {/* Student Protected Routes */}
            <Route path="/payment" element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
            } />
            <Route path="/my-learning" element={
                <ProtectedRoute>
                <MyLearning />
                </ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute>
                <Profile />
                </ProtectedRoute>
            } />
            <Route path="/account" element={
                <ProtectedRoute>
                <AccountSettings />
                </ProtectedRoute>
            } />
            <Route path="/learn/:id" element={
                <ProtectedRoute>
                <CoursePlayer />
                </ProtectedRoute>
            } />
            <Route path="/chat" element={
                <ProtectedRoute>
                <Chat />
                </ProtectedRoute>
            } />

            {/* Mentor Routes (Using MentorAuthProvider) */}
            <Route path="/mentor/login" element={<MentorLogin />} />
            <Route path="/mentor/signup" element={<MentorSignup />} />
            
            <Route path="/mentor" element={
                <MentorProtectedRoute>
                    <MentorLayout />
                </MentorProtectedRoute>
            }>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="courses" element={<MyCourses />} />
                <Route path="create-course" element={<UploadCourse />} />
                <Route path="upload-video" element={<UploadVideos />} />
                <Route path="payments" element={<PaymentVerification />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="blogs" element={<BlogManager />} />
                <Route path="blog/new" element={<BlogEditor />} />
                <Route path="blog/edit/:id" element={<BlogEditor />} />
                <Route path="quiz" element={<QuizBuilder />} />
                <Route path="students" element={<StudentsAnalytics />} />
                <Route path="settings" element={<MentorSettings />} />
                <Route index element={<Navigate to="dashboard" />} />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="financials" element={<AdminFinancials />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="verification" element={<AdminMentorVerification />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="careers" element={<AdminCareers />} />
                <Route index element={<Navigate to="dashboard" />} />
            </Route>

            {/* Dashboard redirect */}
            <Route path="/dashboard" element={<Navigate to="/my-learning" />} />
            </Routes>
            <AIAssistant />
          </AdminAuthProvider>
        </MentorAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
