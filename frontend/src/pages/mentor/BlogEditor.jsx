import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMentorAuth } from '../../context/MentorAuthContext';
import { createBlog, getBlogById, updateBlog } from '../../services/blogService';
import { uploadToS3, getSecureUrl } from '../../services/uploadService';
import { Save, ArrowLeft, Image as ImageIcon, Bold, Italic, Underline, List } from 'lucide-react';

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentMentor } = useMentorAuth();

  const contentRef = useRef(null);

  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [imageKey, setImageKey] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);

  /* LOAD BLOG FOR EDIT */
  useEffect(() => {
    if (!id) return;

    const loadBlog = async () => {
      const blog = await getBlogById(id);
      if (!blog) return;

      setTitle(blog.title);
      setTags(blog.tags || '');
      setImageKey(blog.image || '');

      if (contentRef.current) {
        contentRef.current.innerHTML = blog.content || '';
      }

      if (blog.image) {
        if (blog.image.startsWith('http')) {
          setPreviewImage(blog.image);
        } else {
          const url = await getSecureUrl(blog.image);
          setPreviewImage(url);
        }
      }
    };

    loadBlog();
  }, [id]);

  /* COMMANDS */
  const execCmd = (cmd) => document.execCommand(cmd, false, null);

  /* COVER IMAGE */
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const { key } = await uploadToS3(
      file,
      `mentors/${currentMentor.uid}/blogs/covers`
    );

    setImageKey(key);
    setPreviewImage(await getSecureUrl(key));
  };

  /* INLINE IMAGE */
  const insertInlineImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const { key } = await uploadToS3(
      file,
      `mentors/${currentMentor.uid}/blogs/images`
    );

    const url = await getSecureUrl(key);
    document.execCommand('insertImage', false, url);
  };

  /* SAVE BLOG */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const blogData = {
      title,
      tags,
      image: imageKey,
      content: contentRef.current.innerHTML, // ✅ HTML STORED
      authorId: currentMentor.uid,
      authorName: currentMentor.displayName || currentMentor.email,
      authorImage: currentMentor.photoURL || null,
    };

    try {
      if (id) {
        await updateBlog(id, blogData);
      } else {
        await createBlog(blogData);
      }
      navigate('/mentor/blogs');
    } catch {
      alert('Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <h1 className="text-3xl font-bold">
          {id ? 'Edit Blog' : 'Create Blog'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          className="w-full p-3 border rounded-lg text-xl font-bold"
          placeholder="Blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          className="w-full p-3 border rounded-lg"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        {/* COVER */}
        <label className="block border-2 border-dashed rounded-lg h-60 flex items-center justify-center cursor-pointer">
          <input type="file" hidden accept="image/*" onChange={handleCoverUpload} />
          {previewImage ? (
            <img src={previewImage} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <ImageIcon />
          )}
        </label>

        {/* TOOLBAR */}
        <div className="flex gap-2 border p-2 rounded-lg">
          <button type="button" onClick={() => execCmd('bold')}><Bold /></button>
          <button type="button" onClick={() => execCmd('italic')}><Italic /></button>
          <button type="button" onClick={() => execCmd('underline')}><Underline /></button>
          <button type="button" onClick={() => execCmd('insertUnorderedList')}><List /></button>
          <label>
            <ImageIcon />
            <input type="file" hidden accept="image/*" onChange={insertInlineImage} />
          </label>
        </div>

        {/* CONTENT */}
        <div
          ref={contentRef}
          contentEditable
          className="border rounded-lg p-4 min-h-[400px] prose max-w-none"
        />

        <button
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          <Save /> {loading ? 'Saving…' : 'Publish'}
        </button>
      </form>
    </div>
  );
};

export default BlogEditor;
