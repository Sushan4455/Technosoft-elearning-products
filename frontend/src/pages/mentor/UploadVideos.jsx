import React, { useState } from 'react';
import { Upload, X, Check, Film } from 'lucide-react';

const UploadVideos = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e) => {
      const selectedFiles = Array.from(e.target.files);
      const newFiles = selectedFiles.map(file => ({
          file,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending', // pending, uploading, done
          progress: 0
      }));
      setFiles([...files, ...newFiles]);
  };

  const handleUpload = () => {
      setUploading(true);
      // Simulate upload for each file
      files.forEach((fileItem, idx) => {
          if (fileItem.status === 'done') return;
          
          let currentProgress = 0;
          const interval = setInterval(() => {
              currentProgress += Math.random() * 10;
              if (currentProgress > 100) {
                  currentProgress = 100;
                  clearInterval(interval);
                  setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'done', progress: 100 } : f));
              } else {
                  setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'uploading', progress: currentProgress } : f));
              }
          }, 200 + idx * 100);
      });
  };

  const removeFile = (id) => {
      setFiles(files.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Manager</h1>
        <p className="text-gray-500 mb-8">Upload and manage video lessons for your courses.</p>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8">
            <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl p-12 text-center hover:bg-blue-100 transition-colors relative">
                <input 
                    type="file" 
                    multiple 
                    accept="video/mp4,video/quicktime" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                />
                <div className="w-16 h-16 bg-blue-200 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-blue-900">Drop videos here or click to upload</h3>
                <p className="text-blue-600/70 text-sm mt-1">MP4, MOV up to 500MB</p>
            </div>
        </div>

        {files.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-700">Upload Queue ({files.length})</h3>
                    <button 
                        onClick={handleUpload} 
                        disabled={uploading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                        {uploading ? 'Uploading...' : 'Start Upload'}
                    </button>
                </div>
                <div className="divide-y divide-gray-100">
                    {files.map((item) => (
                        <div key={item.id} className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                <Film className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium text-gray-900 truncate">{item.file.name}</span>
                                    <span className="text-xs text-gray-500">{Math.round(item.progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-300 ${item.status === 'done' ? 'bg-green-500' : 'bg-blue-500'}`} 
                                        style={{ width: `${item.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                            {item.status === 'done' ? (
                                <div className="p-2 text-green-500"><Check className="w-5 h-5" /></div>
                            ) : (
                                <button onClick={() => removeFile(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default UploadVideos;
