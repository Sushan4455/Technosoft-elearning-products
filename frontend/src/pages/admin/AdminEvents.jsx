import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Plus, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({ title: '', date: '', time: '', type: 'Webinar' });

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${API_URL}/events`);
            setEvents(res.data || []);
        } catch (error) {
            console.error("Failed to fetch events");
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/events`, formData);
            fetchEvents();
            setFormData({ title: '', date: '', time: '', type: 'Webinar' });
        } catch (error) {
            alert('Failed to create event');
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Event Management</h2>
            
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Create Event
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input 
                                    type="date" 
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input 
                                    type="time" 
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.time}
                                    onChange={e => setFormData({...formData, time: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                             <select 
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value})}
                             >
                                 <option>Webinar</option>
                                 <option>Workshop</option>
                                 <option>Conference</option>
                                 <option>Meetup</option>
                             </select>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                            Publish Event
                        </button>
                    </form>
                </div>

                {/* Event List */}
                <div className="lg:col-span-2 space-y-4">
                    {events.map((event, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{event.title}</h4>
                                    <p className="text-sm text-gray-500">{event.date} at {event.time} • {event.type}</p>
                                </div>
                            </div>
                            <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            No upcoming events found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminEvents;
