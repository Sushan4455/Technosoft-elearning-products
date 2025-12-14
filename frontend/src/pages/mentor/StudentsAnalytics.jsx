import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Clock, Award } from 'lucide-react';
import { useMentorAuth } from '../../context/MentorAuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';

const StudentRow = ({ name, course, progress, score, joined }) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
    <td className="p-4 pl-6 font-medium text-gray-900">{name}</td>
    <td className="p-4 text-gray-600">{course}</td>
    <td className="p-4">
        <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-xs text-gray-500">{progress}%</span>
        </div>
    </td>
    <td className="p-4 text-gray-600">{score}</td>
    <td className="p-4 text-gray-500 text-sm">{joined}</td>
  </tr>
);

const StudentsAnalytics = () => {
  const { currentMentor } = useMentorAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgCompletion: 0, certificates: 0 });

  useEffect(() => {
      const fetchData = async () => {
          if (!currentMentor) return;

          try {
              // Fetch enrollments for this mentor
              const q = query(collection(db, 'enrollments'), where('mentorId', '==', currentMentor.uid), where('status', '==', 'approved'));
              const snapshot = await getDocs(q);
              
              const enrollments = snapshot.docs.map(doc => doc.data());
              
              // Process Data
              const processed = enrollments.map(e => ({
                  id: e.id,
                  name: e.studentName || e.studentId, // Would ideally fetch user details if name missing
                  course: e.courseName,
                  progress: e.progress || 0,
                  score: "-", // Need quiz implementation to get real score
                  joined: new Date(e.enrolledAt).toLocaleDateString()
              }));

              setStudents(processed);

              // Calc Stats
              const total = processed.length;
              const avgCompletion = total > 0 ? Math.round(processed.reduce((acc, curr) => acc + curr.progress, 0) / total) : 0;
              const certificates = processed.filter(s => s.progress === 100).length;

              setStats({ total, avgCompletion, certificates });

          } catch (error) {
              console.error("Error fetching students:", error);
          } finally {
              setLoading(false);
          }
      };
      fetchData();
  }, [currentMentor]);

  return (
    <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Students & Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm font-medium uppercase mb-1">Total Students</p>
                <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    {stats.total}
                </h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm font-medium uppercase mb-1">Avg. Completion</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.avgCompletion}%</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm font-medium uppercase mb-1">Engagement Time</p>
                <h3 className="text-3xl font-bold text-gray-900">-</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm font-medium uppercase mb-1">Certificates Issued</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.certificates}</h3>
            </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900">Student Performance</h3>
            </div>
            {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : students.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No students enrolled in your courses yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="p-4 pl-6">Student Name</th>
                                <th className="p-4">Enrolled Course</th>
                                <th className="p-4">Progress</th>
                                <th className="p-4">Quiz Avg.</th>
                                <th className="p-4">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s, i) => (
                                <StudentRow key={i} {...s} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
  );
};

export default StudentsAnalytics;
