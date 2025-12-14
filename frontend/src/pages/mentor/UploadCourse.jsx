import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createCourse, updateCourse } from '../../services/mentorService';
import { useMentorAuth } from '../../context/MentorAuthContext';
import { useAuth } from '../../context/AuthContext'; // Import generic auth for points
import { Save, ArrowLeft, Image as ImageIcon, Plus, Trash2, Video, GripVertical, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadToR2, getR2Url } from '../../services/uploadService';

const UploadCourse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentMentor } = useMentorAuth();
  const { awardPoints } = useAuth(); // Helper to award points
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [courseId, setCourseId] = useState(null);
  // Temporary ID for new courses to structure storage properly
  const [tempId] = useState(`temp-${Date.now()}`);
  
  // Basic Info State
  const [formData, setFormData] = useState({
      title: '',
      description: '',
      category: 'Development',
      price: '',
      image: '', 
  });

  // Curriculum State
  const [chapters, setChapters] = useState([
      { id: Date.now(), title: 'Introduction', videos: [{ id: Date.now() + 1, title: '', url: '', uploading: false }] }
  ]);

  useEffect(() => {
      // Check if we are editing (passed via navigation state)
      if (location.state && location.state.course) {
          const { course } = location.state;
          setIsEditing(true);
          setCourseId(course.id);
          setFormData({
              title: course.title || '',
              description: course.description || '',
              category: course.category || 'Development',
              price: course.price || '',
              image: course.image || ''
          });

          // Map existing content back to chapters structure
          if (course.content && Array.isArray(course.content)) {
              const mappedChapters = course.content.map((c, idx) => ({
                  id: Date.now() + idx, // Generate temp ID
                  title: c.section,
                  videos: c.videos ? c.videos.map((v, vIdx) => ({
                      id: v.id || Date.now() + idx + vIdx,
                      title: v.title,
                      url: v.url,
                      uploading: false
                  })) : []
              }));
              setChapters(mappedChapters);
          }
      }
  }, [location.state]);

  const addChapter = () => {
      setChapters([...chapters, { id: Date.now(), title: '', videos: [] }]);
  };

  const removeChapter = (id) => {
      setChapters(chapters.filter(c => c.id !== id));
  };

  const updateChapterTitle = (id, title) => {
      setChapters(chapters.map(c => c.id === id ? { ...c, title } : c));
  };

  const addVideo = (chapterId) => {
      setChapters(chapters.map(c => {
          if (c.id === chapterId) {
              return { ...c, videos: [...c.videos, { id: Date.now(), title: '', url: '', uploading: false }] };
          }
          return c;
      }));
  };

  const removeVideo = (chapterId, videoId) => {
      setChapters(chapters.map(c => {
          if (c.id === chapterId) {
              return { ...c, videos: c.videos.filter(v => v.id !== videoId) };
          }
          return c;
      }));
  };

  const updateVideo = (chapterId, videoId, field, value) => {
      setChapters(chapters.map(c => {
          if (c.id === chapterId) {
              const newVideos = c.videos.map(v => v.id === videoId ? { ...v, [field]: value } : v);
              return { ...c, videos: newVideos };
          }
          return c;
      }));
  };

  // Video Upload
  const handleVideoUpload = async (chapterId, videoId, e) => {
      const file = e.target.files[0];
      if (file) {
          try {
             updateVideo(chapterId, videoId, 'uploading', true);
             // Upload to R2
             const targetCourseId = courseId || tempId;
             const { key } = await uploadToR2(file, `mentors/${currentMentor.uid}/courses/${targetCourseId}/videos`);
             updateVideo(chapterId, videoId, 'url', key); // Store Key
          } catch (error) { 
              console.error("Upload error:", error);
              alert("Video upload failed");
          } finally {
             updateVideo(chapterId, videoId, 'uploading', false);
          }
      }
  };

  // Thumbnail Upload
  const [previewImage, setPreviewImage] = useState('');

  const handleImageChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
          try {
              // Upload to R2
              const targetCourseId = courseId || tempId;
              const { key } = await uploadToR2(file, `mentors/${currentMentor.uid}/courses/${targetCourseId}/images`);
              setFormData({ ...formData, image: key });
              
              const url = await getR2Url(key);
              setPreviewImage(url);
          } catch (error) { // eslint-disable-line no-unused-vars
              alert("Image upload failed");
          }
      }
  };
  
  // Initialize preview
  useEffect(() => {
      const loadPreview = async () => {
          if (formData.image && !formData.image.startsWith('http')) {
              const url = await getR2Url(formData.image);
              setPreviewImage(url);
          } else {
              setPreviewImage(formData.image);
          }
      };
      loadPreview();
  }, [formData.image]);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      const content = chapters.map(ch => ({
          section: ch.title,
          lectures: ch.videos.length,
          duration: "Variable", 
          videos: ch.videos.map(v => ({
              id: v.id,
              title: v.title,
              url: v.url, // This is the R2 key
              duration: "Variable" 
          }))
      }));

      const finalData = { 
        ...formData, 
        mentorId: currentMentor?.uid,
        instructor: currentMentor?.displayName || 'Mentor',
        content,
        ...(isEditing ? {} : { students: 0, rating: 0 })
      };

      try {
          if (!currentMentor) throw new Error("Not authenticated");
          
          if (isEditing && courseId) {
              await updateCourse(courseId, finalData);
              alert("Course updated successfully!");
          } else {
              await createCourse(finalData);
              // Award 10 Points
              if (awardPoints) await awardPoints(10);
              alert("Course published! You earned 10 points.");
          }
          navigate('/mentor/courses');
      } catch (e) {
          console.error(e);
          alert("Failed to save course: " + e.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
        <div className="mb-8 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full"><ArrowLeft className="w-5 h-5"/></button>
            <h1 className="text-3xl font-bold text-gray-900">{isEditing ? 'Edit Course' : 'Create New Course'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold mb-6">Course Information</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Advanced React Patterns"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea 
                            rows="4" 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="What will students learn?"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white outline-none"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option>Development</option>
                                <option>Business</option>
                                <option>Design</option>
                                <option>Marketing</option>
                                <option>IT & Software</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
                                placeholder="Free or 19.99"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Thumbnail */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold mb-6">Course Thumbnail</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                    {previewImage ? (
                        <div className="relative">
                             <img src={previewImage} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                             <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full"><CheckCircle className="w-4 h-4"/></div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-500">
                            <ImageIcon className="w-12 h-12 mb-2 text-gray-400" />
                            <p>Click to upload or drag and drop</p>
                            <p className="text-sm text-gray-400">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Manager / Curriculum */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Curriculum & Videos</h3>
                    <button type="button" onClick={addChapter} className="text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Add Chapter
                    </button>
                </div>

                <div className="space-y-6">
                    {chapters.map((chapter, index) => (
                        <div key={chapter.id} className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 p-4 flex items-center gap-4 border-b border-gray-200">
                                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                                <span className="font-bold text-gray-500">Section {index + 1}:</span>
                                <input 
                                    type="text" 
                                    placeholder="Enter Section Title (e.g. Introduction)" 
                                    className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-gray-900 placeholder-gray-400 outline-none"
                                    value={chapter.title}
                                    onChange={(e) => updateChapterTitle(chapter.id, e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => removeChapter(chapter.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            
                            <div className="p-4 bg-white space-y-4">
                                {chapter.videos.map((video) => (
                                    <div key={video.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors">
                                        <div className="mt-3"><Video className="w-5 h-5 text-blue-500" /></div>
                                        <div className="flex-1 grid gap-4">
                                            <input 
                                                type="text" 
                                                placeholder="Video Title" 
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={video.title}
                                                onChange={(e) => updateVideo(chapter.id, video.id, 'title', e.target.value)}
                                                required
                                            />
                                            <div className="flex gap-4 items-center">
                                                <div className="flex-1 relative">
                                                    <input 
                                                        type="file" 
                                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        accept="video/*"
                                                        onChange={(e) => handleVideoUpload(chapter.id, video.id, e)}
                                                        disabled={video.uploading}
                                                    />
                                                </div>
                                                {video.uploading ? (
                                                    <span className="text-blue-600 text-sm font-bold flex items-center gap-1 w-24 animate-pulse">
                                                        Uploading...
                                                    </span>
                                                ) : video.url ? (
                                                    <span className="text-green-600 text-sm font-bold flex items-center gap-1 w-24 truncate">
                                                        <CheckCircle className="w-3 h-3"/> Uploaded
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm font-medium w-24 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3"/> No file
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => removeVideo(chapter.id, video.id)} className="text-gray-400 hover:text-red-500 mt-2"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addVideo(chapter.id)} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Video
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-4 sticky bottom-0 bg-white/80 backdrop-blur-md p-4 border-t border-gray-200 -mx-4 md:-mx-8 z-10">
                <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg flex items-center gap-2">
                    {loading ? "Saving..." : <><Save className="w-5 h-5"/> {isEditing ? 'Update Course' : 'Publish Course'}</>}
                </button>
            </div>
        </form>
    </div>
  );
};

export default UploadCourse;
