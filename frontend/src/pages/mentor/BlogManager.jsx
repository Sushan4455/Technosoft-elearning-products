import React, { useState, useEffect } from 'react';
import { useMentorAuth } from '../../context/MentorAuthContext';
import { getMentorBlogs, deleteBlog } from '../../services/blogService';
import { Plus, Edit, Trash2, Search, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const BlogManager = () => {
    const { currentMentor } = useMentorAuth();
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            if (currentMentor) {
                const data = await getMentorBlogs(currentMentor.uid);
                setBlogs(data);
                setLoading(false);
            }
        };
        fetchBlogs();
    }, [currentMentor]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this blog?")) {
            await deleteBlog(id);
            setBlogs(blogs.filter(b => b.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
                    <p className="text-gray-500">Share your knowledge with the community.</p>
                </div>
                <Link 
                    to="/mentor/blog/new" 
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg"
                >
                    <Plus className="w-5 h-5" /> Write New Blog
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading blogs...</div>
                ) : blogs.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No blogs yet</h3>
                        <p className="text-gray-500 mb-6">Start writing to engage with your students.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                                <tr>
                                    <th className="p-4 pl-6">Title</th>
                                    <th className="p-4">Published</th>
                                    <th className="p-4">Likes</th>
                                    <th className="p-4 text-right pr-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {blogs.map(blog => (
                                    <tr key={blog.id} className="hover:bg-gray-50">
                                        <td className="p-4 pl-6 font-bold text-gray-900">{blog.title}</td>
                                        <td className="p-4 text-gray-600">{new Date(blog.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-gray-600">{blog.likes || 0}</td>
                                        <td className="p-4 text-right pr-6">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate(`/mentor/blog/edit/${blog.id}`)} 
                                                    className="p-2 hover:bg-gray-200 rounded text-gray-600"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(blog.id)} 
                                                    className="p-2 hover:bg-red-100 rounded text-red-600"
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

export default BlogManager;
