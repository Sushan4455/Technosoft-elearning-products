import React from 'react';
import { Users, DollarSign, BookOpen, AlertTriangle } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
        <div className={`p-4 rounded-xl ${color} text-white`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium uppercase">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

const AdminDashboard = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Platform Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard label="Total Revenue" value="$45,230" icon={DollarSign} color="bg-green-600" />
                <StatCard label="Active Users" value="1,240" icon={Users} color="bg-blue-600" />
                <StatCard label="Total Courses" value="85" icon={BookOpen} color="bg-purple-600" />
                <StatCard label="Pending Approvals" value="12" icon={AlertTriangle} color="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-4">Recent Mentor Applications</h3>
                    <div className="text-gray-500 text-center py-8">No pending applications</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-4">Financial Overview (Monthly)</h3>
                    <div className="text-gray-500 text-center py-8">Chart Placeholder</div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
