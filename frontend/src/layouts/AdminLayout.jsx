import React from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Shield, LayoutDashboard, Users, BookOpen, DollarSign, LogOut, Calendar, Briefcase, CheckSquare } from 'lucide-react';

const AdminLayout = () => {
    const { currentAdmin, logout } = useAdminAuth();
    const location = useLocation();

    if (!currentAdmin) return <Navigate to="/admin/login" />;

    const navItems = [
        { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Verifications', path: '/admin/verification', icon: CheckSquare },
        { label: 'Financials', path: '/admin/financials', icon: DollarSign },
        { label: 'Events', path: '/admin/events', icon: Calendar },
        { label: 'Careers', path: '/admin/careers', icon: Briefcase },
        { label: 'Users', path: '/admin/users', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col fixed inset-y-0">
                <div className="h-16 flex items-center px-6 border-b border-gray-800">
                    <Shield className="w-6 h-6 text-red-500 mr-2" />
                    <span className="font-bold text-lg">Admin Panel</span>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                location.pathname === item.path ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-400 hover:text-red-400">
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
