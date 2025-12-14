import { mentorDb } from '../firebaseMentor';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
  getDoc
} from 'firebase/firestore';

/* =====================================================
   COURSES
   ===================================================== */

export const createCourse = async (courseData) => {
  const finalData = {
    ...courseData,
    students: courseData.students || 0,
    rating: courseData.rating || 0,
    reviews: courseData.reviews || 0,
    createdAt: new Date().toISOString()
  };

  const ref = await addDoc(collection(mentorDb, 'courses'), finalData);
  return { id: ref.id, ...finalData };
};

export const getMentorCourses = async (mentorId) => {
  if (!mentorId) return [];
  const q = query(collection(mentorDb, 'courses'), where('mentorId', '==', mentorId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getCourseById = async (courseId) => {
  if (!courseId) return null;
  const snap = await getDoc(doc(mentorDb, 'courses', courseId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateCourse = async (courseId, data) => {
  if (!courseId) return false;
  await updateDoc(doc(mentorDb, 'courses', courseId), data);
  return true;
};

export const deleteCourse = async (courseId) => {
  if (!courseId) return false;
  await deleteDoc(doc(mentorDb, 'courses', courseId));
  return true;
};

/* =====================================================
   ASSIGNMENTS
   ===================================================== */

export const createAssignment = async (data) => {
  const payload = { ...data, createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(mentorDb, 'assignments'), payload);
  return { id: ref.id, ...payload };
};

export const getAssignments = async (mentorId) => {
  if (!mentorId) return [];
  const q = query(collection(mentorDb, 'assignments'), where('mentorId', '==', mentorId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getCourseAssignments = async (courseId) => {
  if (!courseId) return [];
  const q = query(collection(mentorDb, 'assignments'), where('courseId', '==', courseId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteAssignment = async (id) => {
  if (!id) return false;
  await deleteDoc(doc(mentorDb, 'assignments', id));
  return true;
};

/* =====================================================
   QUIZZES
   ===================================================== */

export const createQuiz = async (data) => {
  const payload = { ...data, createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(mentorDb, 'quizzes'), payload);
  return { id: ref.id, ...payload };
};

export const getQuizzes = async (mentorId) => {
  if (!mentorId) return [];
  const q = query(collection(mentorDb, 'quizzes'), where('mentorId', '==', mentorId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getCourseQuizzes = async (courseId) => {
  if (!courseId) return [];
  const q = query(collection(mentorDb, 'quizzes'), where('courseId', '==', courseId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteQuiz = async (id) => {
  if (!id) return false;
  await deleteDoc(doc(mentorDb, 'quizzes', id));
  return true;
};

/* =====================================================
   BLOGS (MENTOR SIDE)
   ===================================================== */

export const getMentorBlogs = async (mentorId) => {
  if (!mentorId) return [];
  const q = query(collection(mentorDb, 'blogs'), where('authorId', '==', mentorId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/* =====================================================
   MENTORS (PUBLIC)
   ===================================================== */

export const getAllMentors = async () => {
  const snap = await getDocs(collection(mentorDb, 'mentors'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getMentorById = async (mentorId) => {
  if (!mentorId) return null;
  const snap = await getDoc(doc(mentorDb, 'mentors', mentorId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateMentorProfile = async (mentorId, data) => {
  if (!mentorId) return false;
  await updateDoc(doc(mentorDb, 'mentors', mentorId), {
    ...data,
    updatedAt: new Date().toISOString()
  });
  return true;
};

/* =====================================================
   DASHBOARD / STATS
   ===================================================== */

export const getMentorStats = async (mentorId) => {
  if (!mentorId) {
    return {
      totalCourses: 0,
      totalAssignments: 0,
      totalQuizzes: 0,
      totalVideos: 0
    };
  }

  const courses = await getMentorCourses(mentorId);
  const assignments = await getAssignments(mentorId);
  const quizzes = await getQuizzes(mentorId);

  let totalVideos = 0;
  courses.forEach(course => {
    if (Array.isArray(course.content)) {
      course.content.forEach(section => {
        if (Array.isArray(section.videos)) {
          totalVideos += section.videos.length;
        }
      });
    }
  });

  return {
    totalCourses: courses.length,
    totalAssignments: assignments.length,
    totalQuizzes: quizzes.length,
    totalVideos
  };
};
