import React, { useState, useEffect } from 'react';
import { FileText, Plus, Upload, Trash2, ExternalLink } from 'lucide-react';
import { uploadToS3, getSecureUrl } from '../../services/uploadService';
import { createAssignment, getAssignments, deleteAssignment, getMentorCourses } from '../../services/mentorService';
import { useMentorAuth } from '../../context/MentorAuthContext';

const Assignments = () => {
  const { currentMentor } = useMentorAuth();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [newAssignment, setNewAssignment] = useState({ title: '', courseId: '', courseName: '', deadline: '', file: null });

  useEffect(() => {
      const fetchData = async () => {
          if (currentMentor) {
              setLoadingData(true);
              const [fetchedAssignments, fetchedCourses] = await Promise.all([
                  getAssignments(currentMentor.uid),
                  getMentorCourses(currentMentor.uid)
              ]);
              setAssignments(fetchedAssignments);
              setCourses(fetchedCourses);
              setLoadingData(false);
          }
      };
      fetchData();
  }, [currentMentor]);

  const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
          try {
              setLoading(true);
              const { key } = await uploadToS3(file, `mentor-uploads/${currentMentor.uid}/assignments`);
              setNewAssignment(prev => ({ ...prev, file: key }));
          } catch (error) { // eslint-disable-line no-unused-vars
              alert("File upload failed");
          } finally {
              setLoading(false);
          }
      }
  };

  const handleCourseSelect = (e) => {
      const selectedId = e.target.value;
      const selectedCourse = courses.find(c => c.id === selectedId);
      setNewAssignment({
          ...newAssignment,
          courseId: selectedId,
          courseName: selectedCourse ? selectedCourse.title : ''
      });
  };

  const handleAdd = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
          const created = await createAssignment({ 
              ...newAssignment, 
              mentorId: currentMentor.uid 
          });
          setAssignments([...assignments, created]);
          setShowModal(false);
          setNewAssignment({ title: '', courseId: '', courseName: '', deadline: '', file: null });
      } catch (error) { // eslint-disable-line no-unused-vars
          alert("Failed to create assignment");
      } finally {
          setLoading(false);
      }
  };

  const handleDelete = async (id) => {
      if (window.confirm("Delete this assignment?")) {
          await deleteAssignment(id);
          setAssignments(assignments.filter(a => a.id !== id));
      }
  };

  if (loadingData) return <div className="p-8 text-center text-gray-500">Loading assignments...</div>;

  return (
    <div>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg">
                <Plus className="w-5 h-5" /> New Assignment
            </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                    <tr>
                        <th className="p-4 pl-6">Title</th>
                        <th className="p-4">Course</th>
                        <th className="p-4">Deadline</th>
                        <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {assignments.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">No assignments created yet.</td></tr>
                    ) : (
                        assignments.map(a => (
                            <AssignmentRow key={a.id} assignment={a} onDelete={handleDelete} />
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Modal */}
        {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl transform transition-all">
                    <h2 className="text-2xl font-bold mb-6">Create Assignment</h2>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Assignment Title" 
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newAssignment.title}
                            onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                            required
                        />
                        <select 
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={newAssignment.courseId}
                            onChange={handleCourseSelect}
                            required
                        >
                            <option value="">Select Course</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                        <input 
                            type="date" 
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newAssignment.deadline}
                            onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})}
                            required
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 relative transition-colors">
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                            />
                            {newAssignment.file ? (
                                <div className="text-green-600 font-bold flex items-center justify-center gap-2">
                                    <FileText className="w-5 h-5"/> File Uploaded
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <span className="text-sm text-gray-500">{loading ? "Uploading..." : "Upload Instructions (PDF/Doc)"}</span>
                                </>
                            )}
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" disabled={loading || !newAssignment.file} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                                {loading ? 'Saving...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

const AssignmentRow = ({ assignment, onDelete }) => {
    const [fileUrl, setFileUrl] = useState(null);

    useEffect(() => {
        const fetchUrl = async () => {
            if (assignment.file && !assignment.file.startsWith('http')) {
                const url = await getSecureUrl(assignment.file);
                setFileUrl(url);
            } else {
                setFileUrl(assignment.file);
            }
        };
        fetchUrl();
    }, [assignment.file]);

    return (
        <tr className="hover:bg-gray-50">
            <td className="p-4 pl-6 font-medium text-gray-900 flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded text-orange-600"><FileText className="w-4 h-4" /></div>
                {fileUrl ? (
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600 flex items-center gap-1">
                        {assignment.title} <ExternalLink className="w-3 h-3"/>
                    </a>
                ) : (
                    <span>{assignment.title}</span>
                )}
            </td>
            <td className="p-4 text-gray-600">{assignment.courseName}</td>
            <td className="p-4 text-gray-600">{assignment.deadline}</td>
            <td className="p-4 text-right pr-6">
                <button onClick={() => onDelete(assignment.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
            </td>
        </tr>
    );
};

export default Assignments;
