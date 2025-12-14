import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

const BLOGS_COLLECTION = 'blogs';

/* =========================
   CREATE BLOG (MENTOR)
   ========================= */
export const createBlog = async (blogData) => {
  const data = {
    ...blogData,
    likes: 0,
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, BLOGS_COLLECTION), data);
  return { id: docRef.id, ...data };
};

/* =========================
   UPDATE BLOG (MENTOR)
   ========================= */
export const updateBlog = async (id, blogData) => {
  await updateDoc(doc(db, BLOGS_COLLECTION, id), {
    ...blogData,
    updatedAt: new Date().toISOString()
  });
  return true;
};

/* =========================
   DELETE BLOG (MENTOR)
   ========================= */
export const deleteBlog = async (id) => {
  await deleteDoc(doc(db, BLOGS_COLLECTION, id));
  return true;
};

/* =========================
   GET BLOG BY ID (PUBLIC)
   ========================= */
export const getBlogById = async (id) => {
  const snap = await getDoc(doc(db, BLOGS_COLLECTION, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/* =========================
   GET ALL BLOGS (STUDENT)
   ========================= */
export const getAllBlogs = async () => {
  const q = query(
    collection(db, BLOGS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/* =========================
   GET BLOGS BY MENTOR
   ========================= */
export const getMentorBlogs = async (mentorId) => {
  const q = query(
    collection(db, BLOGS_COLLECTION),
    where('authorId', '==', mentorId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/* =========================
   ADD COMMENT (STUDENT)
   ========================= */
export const addComment = async (blogId, comment) => {
  const blogRef = doc(db, BLOGS_COLLECTION, blogId);
  const blogSnap = await getDoc(blogRef);

  if (!blogSnap.exists()) return;

  const comments = blogSnap.data().comments || [];
  comments.push(comment);

  await updateDoc(blogRef, { comments });
};
