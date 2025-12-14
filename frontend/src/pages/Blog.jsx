import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllBlogs } from '../services/blogService';
import { getSecureUrl } from '../services/uploadService';

const BlogPost = ({ id, title, content, createdAt, authorName, image }) => {
  const [imageUrl, setImageUrl] = useState(image);

  useEffect(() => {
    const loadUrl = async () => {
        if (image && !image.startsWith('http')) {
            const url = await getSecureUrl(image);
            setImageUrl(url);
        }
    };
    loadUrl();
  }, [image]);

  return (
    <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all h-full flex flex-col"
    >
        <div className="relative h-48 overflow-hidden bg-gray-100">
        {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
        </div>
        <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {authorName || 'Mentor'}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
            <Link to={`/blog/${id}`}>{title}</Link>
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
            {content ? content.substring(0, 150) + "..." : "No content"}
        </p>
        <Link to={`/blog/${id}`} className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm hover:gap-2 transition-all mt-auto">
            Read Article <ArrowRight className="w-4 h-4" />
        </Link>
        </div>
    </motion.div>
  );
};

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
      const fetchBlogs = async () => {
          const data = await getAllBlogs();
          setPosts(data);
          setLoading(false);
      };
      fetchBlogs();
  }, []);

  const filteredPosts = posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (post.authorName && post.authorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">Insights, tutorials, and news from the EduPro team. Stay updated with the latest in technology and education.</p>
          
          <div className="relative max-w-lg mx-auto">
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          </div>
        </div>

        {loading ? (
            <div className="text-center py-20 text-gray-500">Loading articles...</div>
        ) : filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
                <BlogPost key={post.id} {...post} />
            ))}
            </div>
        ) : (
            <div className="text-center py-20 text-gray-500">No articles found.</div>
        )}
      </div>
    </div>
  );
};

export default Blog;
