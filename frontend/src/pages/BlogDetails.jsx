import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Calendar,
  Clock,
  ChevronLeft,
  Twitter,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Send
} from 'lucide-react';
import { getBlogById, addComment } from '../services/blogService';
import { getSecureUrl } from '../services/uploadService';
import { useAuth } from '../context/AuthContext';

const BlogDetails = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [commentText, setCommentText] = useState('');

  /* LOAD BLOG */
  useEffect(() => {
    const fetchPost = async () => {
      const data = await getBlogById(id);
      if (data) {
        setPost(data);

        if (data.image) {
          if (data.image.startsWith('http')) {
            setImageUrl(data.image);
          } else {
            const url = await getSecureUrl(data.image);
            setImageUrl(url);
          }
        }
      }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  /* ADD COMMENT */
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;

    const newComment = {
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      text: commentText,
      date: new Date().toISOString()
    };

    await addComment(id, newComment);

    setPost(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newComment]
    }));

    setCommentText('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Post not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <article className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 mb-8"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {post.tags &&
              post.tags.split(',').map((tag, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase"
                >
                  {tag.trim()}
                </span>
              ))}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-gray-500 border-b pb-8">
            <div className="flex items-center gap-2">
              <img
                className="w-10 h-10 rounded-full"
                src={
                  post.authorImage ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`
                }
                alt={post.authorName}
              />
              <span className="font-medium text-gray-900">
                {post.authorName}
              </span>
            </div>

            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              5 min read
            </span>
          </div>
        </div>

        {/* COVER IMAGE */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-[400px] object-cover rounded-2xl mb-12"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* CONTENT */}
          <div className="lg:col-span-8">
            {/* ✅ FIXED RICH TEXT RENDERING */}
            <div
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* COMMENTS */}
            <div className="mt-16 pt-8 border-t">
              <h3 className="text-2xl font-bold mb-6">
                Comments ({post.comments?.length || 0})
              </h3>

              {currentUser ? (
                <form onSubmit={handleComment} className="mb-8 relative">
                  <textarea
                    className="w-full border rounded-xl p-4 pr-12"
                    rows="3"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute bottom-4 right-4 bg-blue-600 text-white p-2 rounded-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <Link to="/login" className="text-blue-600 font-bold">
                  Log in to comment
                </Link>
              )}

              <div className="space-y-6">
                {post.comments?.map((c, i) => (
                  <div key={i} className="flex gap-4">
                    <img
                      className="w-10 h-10 rounded-full"
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.userName}`}
                      alt={c.userName}
                    />
                    <div>
                      <div className="font-bold">{c.userName}</div>
                      <p className="text-gray-600">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SHARE */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="font-bold mb-4">Share this article</h3>
              <div className="flex gap-2">
                <Twitter />
                <Facebook />
                <Linkedin />
                <LinkIcon />
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetails;
