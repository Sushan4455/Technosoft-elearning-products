import React, { useState, useEffect } from 'react';
import { getMentorPendingEnrollments, getMentorApprovedEnrollments, approveEnrollment, rejectEnrollment } from '../../services/enrollmentService';
import { useMentorAuth } from '../../context/MentorAuthContext';
import { CheckCircle, XCircle, ExternalLink, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { getSecureUrl } from '../../services/uploadService';

const PaymentVerification = () => {
    const { currentMentor } = useMentorAuth();
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingEnrollments, setPendingEnrollments] = useState([]);
    const [approvedEnrollments, setApprovedEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const fetchEnrollments = async () => {
            if (currentMentor) {
                const pending = await getMentorPendingEnrollments(currentMentor.uid);
                const approved = await getMentorApprovedEnrollments(currentMentor.uid);
                setPendingEnrollments(pending);
                setApprovedEnrollments(approved);
            }
            setLoading(false);
        };
        fetchEnrollments();
    }, [currentMentor]);

    const handleApprove = async (id) => {
        if (!window.confirm("Approve this enrollment?")) return;
        
        setActionLoading(id);
        try {
            await approveEnrollment(id);
            // Move from pending to approved locally
            const approvedItem = pendingEnrollments.find(e => e.id === id);
            setPendingEnrollments(prev => prev.filter(e => e.id !== id));
            if(approvedItem) setApprovedEnrollments(prev => [...prev, { ...approvedItem, status: 'approved' }]);
        } catch (error) { // eslint-disable-line no-unused-vars
            alert("Failed to approve");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        setActionLoading(id);
        try {
            await rejectEnrollment(id, reason);
            setPendingEnrollments(prev => prev.filter(e => e.id !== id));
        } catch (error) { // eslint-disable-line no-unused-vars
            alert("Failed to reject");
        } finally {
            setActionLoading(null);
        }
    };

    // Calculate Earnings
    const calculateEarnings = () => {
        const totalRevenue = approvedEnrollments.reduce((sum, e) => sum + (e.coursePrice || 0), 0);
        const mentorShare = totalRevenue * 0.6;
        const platformShare = totalRevenue * 0.4;
        return { totalRevenue, mentorShare, platformShare };
    };

    const earnings = calculateEarnings();

    if (loading) return <div className="p-8 text-center text-gray-500">Loading payments...</div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Payments & Earnings</h1>
                <p className="text-gray-500">Manage approvals and view your revenue.</p>
            </div>

            {/* Earnings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-green-100 text-green-600"><DollarSign className="w-6 h-6" /></div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase">Your Earnings (60%)</p>
                        <h3 className="text-2xl font-bold text-gray-900">${earnings.mentorShare.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-blue-100 text-blue-600"><TrendingUp className="w-6 h-6" /></div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase">Total Sales</p>
                        <h3 className="text-2xl font-bold text-gray-900">${earnings.totalRevenue.toFixed(2)}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-purple-100 text-purple-600"><CheckCircle className="w-6 h-6" /></div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase">Paid Students</p>
                        <h3 className="text-2xl font-bold text-gray-900">{approvedEnrollments.length}</h3>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Pending Approvals ({pendingEnrollments.length})
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Earning History
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {activeTab === 'pending' ? (
                    pendingEnrollments.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                            <p>No pending payments.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                                    <tr>
                                        <th className="p-4 pl-6">Student</th>
                                        <th className="p-4">Course</th>
                                        <th className="p-4">Price</th>
                                        <th className="p-4">Proof</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4 text-right pr-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pendingEnrollments.map((enrollment) => (
                                        <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 pl-6 font-medium text-gray-900">
                                                {enrollment.studentName || enrollment.studentId}
                                            </td>
                                            <td className="p-4 text-gray-600">{enrollment.courseName}</td>
                                            <td className="p-4 font-bold text-gray-900">${enrollment.coursePrice || 0}</td>
                                            <td className="p-4">
                                                <ScreenshotLink url={enrollment.paymentProofUrl} />
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleApprove(enrollment.id)}
                                                        disabled={actionLoading === enrollment.id}
                                                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold hover:bg-green-200 disabled:opacity-50"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(enrollment.id)}
                                                        disabled={actionLoading === enrollment.id}
                                                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    // HISTORY TAB
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                                <tr>
                                    <th className="p-4 pl-6">Student</th>
                                    <th className="p-4">Course</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Total Price</th>
                                    <th className="p-4 text-green-600">Your Earning (60%)</th>
                                    <th className="p-4 text-blue-600">Platform Fee (40%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {approvedEnrollments.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">No earning history yet.</td></tr>
                                ) : (
                                    approvedEnrollments.map((enrollment) => {
                                        const price = enrollment.coursePrice || 0;
                                        return (
                                            <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 pl-6 font-medium text-gray-900">
                                                    {enrollment.studentName || enrollment.studentId}
                                                </td>
                                                <td className="p-4 text-gray-600">{enrollment.courseName}</td>
                                                <td className="p-4 text-gray-500 text-sm">
                                                    {new Date(enrollment.approvedAt || enrollment.updatedAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 font-bold text-gray-900">${price}</td>
                                                <td className="p-4 font-bold text-green-600">+${(price * 0.6).toFixed(2)}</td>
                                                <td className="p-4 font-bold text-blue-600">${(price * 0.4).toFixed(2)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const ScreenshotLink = ({ url }) => {
    const [secureUrl, setSecureUrl] = useState(null);

    useEffect(() => {
        const fetchUrl = async () => {
            if (url && !url.startsWith('http')) {
                const link = await getSecureUrl(url);
                setSecureUrl(link);
            } else {
                setSecureUrl(url);
            }
        };
        fetchUrl();
    }, [url]);

    if (!secureUrl) return <span className="text-gray-400 text-sm">Loading...</span>;

    return (
        <a 
            href={secureUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:underline"
        >
            <ExternalLink className="w-4 h-4" /> View Screenshot
        </a>
    );
};

export default PaymentVerification;
