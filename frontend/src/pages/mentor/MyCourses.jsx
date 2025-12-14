import React, { useState, useEffect } from 'react';
import { getMentorCourses, deleteCourse } from '../../services/mentorService';
import { Plus, Edit, Trash2, Search, MoreVertical } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMentorAuth } from '../../context/MentorAuthContext';

const MyCourses = () => {
  const { currentMentor } = useMentorAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (currentMentor) {
        const data = await getMentorCourses(currentMentor.uid);
        setCourses(data);
      }
      setLoading(false);
    };
    fetchCourses();
  }, [currentMentor]);

  const handleDelete = async (id) => {
      if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
          await deleteCourse(id);
          setCourses(courses.filter(c => c.id !== id));
      }
  };

  const handleEdit = (course) => {
      navigate('/mentor/create-course', { state: { course } });
  };

  return (
    <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
                <p className="text-gray-500">Manage and create your courses.</p>
            </div>
            <Link to="/mentor/create-course" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                <Plus className="w-5 h-5" /> Create New Course
            </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100">
                <div className="relative max-w-md">
                    <input type="text" placeholder="Search courses..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Loading courses...</div>
            ) : courses.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Plus className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No courses yet</h3>
                    <p className="text-gray-500 mb-6">Create your first course to start teaching.</p>
                    <Link to="/mentor/create-course" className="text-blue-600 font-bold hover:underline">Create Course</Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="p-4 pl-6">Course Title</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Students</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {courses.map((course) => (
                                <tr key={course.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4 pl-6 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                            {course.image && <img src={course.image} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <span className="font-bold text-gray-900">{course.title}</span>
                                    </td>
                                    <td className="p-4 text-gray-600">{course.category || 'General'}</td>
                                    <td className="p-4 font-medium text-gray-900">{course.price || 'Free'}</td>
                                    <td className="p-4 text-gray-600">{course.students || 0}</td>
                                    <td className="p-4">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Published</span>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleEdit(course)} 
                                                className="p-2 hover:bg-gray-200 rounded text-gray-600"
                                                title="Edit Course"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(course.id)} 
                                                className="p-2 hover:bg-red-100 rounded text-red-600"
                                                title="Delete Course"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
  );
};

export default MyCourses;
