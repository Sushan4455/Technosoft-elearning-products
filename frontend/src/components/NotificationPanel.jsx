import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserNotifications, markNotificationRead } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

const NotificationPanel = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (isOpen && currentUser) {
            const fetchNotifs = async () => {
                const data = await getUserNotifications(currentUser.uid);
                setNotifications(data);
            };
            fetchNotifs();
        }
    }, [isOpen, currentUser]);

    const handleMarkRead = async (id) => {
        await markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40"
                    />
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
                    >
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <Bell className="w-5 h-5" /> Notifications
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {notifications.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">
                                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        className={`p-4 rounded-xl border transition-all ${
                                            notif.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'
                                        }`}
                                        onClick={() => handleMarkRead(notif.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1">
                                                {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                                {notif.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                                                {notif.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                    {notif.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                                                <span className="text-xs text-gray-400 mt-2 block">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
