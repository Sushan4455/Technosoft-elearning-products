import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Plus, Users } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const AdminCareers = () => {
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [view, setView] = useState('jobs'); // 'jobs' or 'applications'
    const [formData, setFormData] = useState({ title: '', type: 'Full-time', location: 'Remote', description: '', requirements: '' });

    const fetchData = async () => {
        try {
            const [jobsRes, appsRes] = await Promise.all([
                axios.get(`${API_URL}/careers`),
                axios.get(`${API_URL}/careers/applications`)
            ]);
            setJobs(jobsRes.data || []);
            setApplications(appsRes.data || []);
        } catch (error) {
            console.error("Failed to fetch data");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/careers`, formData);
            fetchData();
            setFormData({ title: '', type: 'Full-time', location: 'Remote', description: '', requirements: '' });
        } catch (error) {
            alert('Failed to post job');
        }
    };

    const handleDeleteJob = async (id) => {
        try {
            await axios.delete(`${API_URL}/careers/${id}`);
            fetchData();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="p-8">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Career Management</h2>
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
                    <button 
                        onClick={() => setView('jobs')}
                        className={`px-4 py-2 rounded-md font-medium transition-all ${view === 'jobs' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Positions
                    </button>
                    <button 
                        onClick={() => setView('applications')}
                        className={`px-4 py-2 rounded-md font-medium transition-all ${view === 'applications' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Applications ({applications.length})
                    </button>
                </div>
            </div>

            {view === 'jobs' ? (
                <div className="grid lg:grid-cols-3 gap-8">
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5" /> Post New Job
                        </h3>
                        <form onSubmit={handleCreateJob} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                <input 
                                    type="text" required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select 
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.type}
                                        onChange={e => setFormData({...formData, type: e.target.value})}
                                    >
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.location}
                                        onChange={e => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                                Post Job
                            </button>
                        </form>
                     </div>

                     <div className="lg:col-span-2 space-y-4">
                        {jobs.map(job => (
                            <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">{job.title}</h4>
                                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                        <span>{job.type}</span>
                                        <span>•</span>
                                        <span>{job.location}</span>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteJob(job.id)} className="text-red-600 text-sm font-medium hover:underline">
                                    Remove
                                </button>
                            </div>
                        ))}
                     </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-gray-600">Name</th>
                                <th className="p-4 text-gray-600">Contact</th>
                                <th className="p-4 text-gray-600">Position</th>
                                <th className="p-4 text-gray-600">CV</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app, i) => (
                                <tr key={i} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">{app.name}</td>
                                    <td className="p-4 text-sm text-gray-500">
                                        <div>{app.email}</div>
                                        <div>{app.phone}</div>
                                    </td>
                                    <td className="p-4">{app.jobTitle || 'General'}</td>
                                    <td className="p-4">
                                        <a href="#" className="text-blue-600 hover:underline">Download CV</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminCareers;
