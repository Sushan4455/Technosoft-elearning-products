import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, HelpCircle, Users, TrendingUp } from 'lucide-react';
import { getMentorStats } from '../../services/mentorService';
import { useMentorAuth } from '../../context/MentorAuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition-shadow">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-8 h-8 text-white" />
    </div>
    <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{label}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const { currentMentor } = useMentorAuth();
  const [stats, setStats] = useState({
      totalCourses: 0,
      totalStudents: 0,
      totalVideos: 0,
      totalAssignments: 0,
      totalQuizzes: 0,
      completionRate: '0%'
  });
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchData = async () => {
          if (currentMentor) {
              const data = await getMentorStats(currentMentor.uid);
              setStats(prev => ({ ...prev, ...data }));

              // Fetch recent enrollments
              try {
                  const q = query(
                      collection(db, 'enrollments'), 
                      where('mentorId', '==', currentMentor.uid), 
                      where('status', '==', 'approved'),
                      orderBy('enrolledAt', 'desc'),
                      limit(5)
                  );
                  const snapshot = await getDocs(q);
                  setRecentEnrollments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
              } catch (error) {
                  console.error("Error fetching recent enrollments:", error);
              }
          }
          setLoading(false);
      };
      fetchData();
  }, [currentMentor]);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div>
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500">Welcome back, {currentMentor?.displayName || 'Mentor'}. Here's what's happening today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard label="Total Courses" value={stats.totalCourses} icon={BookOpen} color="bg-blue-500" />
            <StatCard label="Total Videos" value={stats.totalVideos} icon={Video} color="bg-purple-500" />
            <StatCard label="Assignments" value={stats.totalAssignments} icon={FileText} color="bg-orange-500" />
            <StatCard label="Total Quizzes" value={stats.totalQuizzes || 0} icon={HelpCircle} color="bg-pink-500" />
            <StatCard label="Students Enrolled" value={stats.totalStudents} icon={Users} color="bg-green-500" />
            <StatCard label="Completion Rate" value={stats.completionRate || 'N/A'} icon={TrendingUp} color="bg-teal-500" />
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Enrolments</h3>
            <div className="overflow-x-auto">
                {recentEnrollments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No recent enrollments.</p>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="py-3">Student Name</th>
                                <th className="py-3">Course</th>
                                <th className="py-3">Date</th>
                                <th className="py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {recentEnrollments.map(e => (
                                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 font-medium">{e.studentName || e.studentId}</td>
                                    <td className="py-3">{e.courseName}</td>
                                    <td className="py-3">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                                    <td className="py-3">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold capitalize">{e.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
