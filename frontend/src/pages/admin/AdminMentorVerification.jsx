import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Eye, FileText } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const AdminMentorVerification = () => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch pending verifications (Mock for now, needs DB integration)
        // In real app: axios.get(`${API_URL}/admin/mentors/pending`)
        setApplicants([
            { id: 1, name: "John Doe", email: "john@example.com", field: "Computer Science", status: "pending", documents: ["id_card.pdf", "degree.pdf"] },
            { id: 2, name: "Jane Smith", email: "jane@example.com", field: "Design", status: "pending", documents: ["passport.jpg"] }
        ]);
        setLoading(false);
    }, []);

    const handleApprove = (id) => {
        // API call to approve
        setApplicants(applicants.filter(a => a.id !== id));
        alert(`Approved mentor ${id}`);
    };

    const handleReject = (id) => {
        const reason = prompt("Enter rejection reason:");
        if (reason) {
            // API call to reject
            setApplicants(applicants.filter(a => a.id !== id));
            alert(`Rejected mentor ${id}: ${reason}`);
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Mentor Verification</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Name</th>
                            <th className="p-4 font-semibold text-gray-600">Field</th>
                            <th className="p-4 font-semibold text-gray-600">Documents</th>
                            <th className="p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applicants.map(app => (
                            <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="font-medium text-gray-900">{app.name}</div>
                                    <div className="text-sm text-gray-500">{app.email}</div>
                                </td>
                                <td className="p-4 text-gray-600">{app.field}</td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {app.documents.map((doc, i) => (
                                            <button key={i} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                                                <FileText className="w-3 h-3" /> View
                                            </button>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleApprove(app.id)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleReject(app.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {applicants.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No pending verifications.</div>
                )}
            </div>
        </div>
    );
};

export default AdminMentorVerification;
