import { db, auth } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';

// Mock Data for fallback
const MOCK_USER_DB = {};

// Helper to check if we are in mock mode (using AuthContext logic usually, but here we check directly if db is initialized or we force it if auth fails)
const isMockMode = () => !auth.currentUser && localStorage.getItem('mockUser');

export const createUserProfile = async (uid, data) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userData = {
      uid,
      name: data.name || '',
      email: data.email || '',
      username: data.username || '', // Public username
      phone: data.phone || '',
      role: data.role || 'student', // 'student' | 'mentor' | 'admin'
      points: data.points || 0, // Points System
      dob: '',
      country: '',
      gender: '',
      photoUrl: data.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
      bio: 'Lifelong learner.',
      emailVisibility: 'private', // private or public
      billingMethods: [],
      security: {
        twoFactor: false,
        loginHistory: [
            { date: new Date().toISOString(), device: navigator.userAgent, ip: '127.0.0.1' }
        ]
      },
      enrolledCourses: [], // { courseId, progress, enrolledAt }
      createdAt: new Date().toISOString()
    };

    await setDoc(userRef, userData);
    return userData;
  } catch (error) {
    console.warn("Firestore create failed, using mock DB", error);
    // Mock Fallback
    MOCK_USER_DB[uid] = {
      uid,
      name: data.name,
      email: data.email,
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
      billingMethods: [],
      security: { twoFactor: false, loginHistory: [] },
      enrolledCourses: [],
      points: 0
    };
    return MOCK_USER_DB[uid];
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // If user exists in Auth but not DB (legacy), create default
      // For now, return null or mock
      return MOCK_USER_DB[uid] || null;
    }
  } catch (error) {
    console.warn("Firestore get failed, using mock DB", error);
    return MOCK_USER_DB[uid] || null;
  }
};

export const updateUserProfile = async (uid, data) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
    return true;
  } catch (error) {
    console.warn("Firestore update failed", error);
    if (MOCK_USER_DB[uid]) {
        MOCK_USER_DB[uid] = { ...MOCK_USER_DB[uid], ...data };
        return true;
    }
    return false;
  }
};

// Points System
export const updateUserPoints = async (uid, points) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { points }); 
        return true;
    } catch (error) {
        if (MOCK_USER_DB[uid]) {
            MOCK_USER_DB[uid].points = points;
        }
        return false;
    }
};

export const updateUserPhoto = async (uid, photoUrl) => {
    return updateUserProfile(uid, { photoUrl });
};

export const updateUserSecurity = async (uid, securityData) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { security: securityData });
        return true;
    } catch (error) {
        if (MOCK_USER_DB[uid]) {
            MOCK_USER_DB[uid].security = { ...MOCK_USER_DB[uid].security, ...securityData };
            return true;
        }
        return false;
    }
};

export const enrollInCourse = async (uid, courseId) => {
    try {
        const userRef = doc(db, 'users', uid);
        const enrollment = {
            courseId,
            progress: 0,
            enrolledAt: new Date().toISOString()
        };
        await updateDoc(userRef, {
            enrolledCourses: arrayUnion(enrollment),
            points: increment(10) // +10 Points on enrollment
        });
        return true;
    } catch (error) {
        console.warn("Enrollment failed", error);
        if (MOCK_USER_DB[uid]) {
            MOCK_USER_DB[uid].enrolledCourses.push({
                courseId,
                progress: 0,
                enrolledAt: new Date().toISOString()
            });
            MOCK_USER_DB[uid].points = (MOCK_USER_DB[uid].points || 0) + 10;
            return true;
        }
        return false;
    }
};

export const updateUserBilling = async (uid, newMethod) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            billingMethods: arrayUnion(newMethod)
        });
        return true;
    } catch (error) {
        if (MOCK_USER_DB[uid]) {
            MOCK_USER_DB[uid].billingMethods.push(newMethod);
            return true;
        }
        return false;
    }
};

export const changeUserPassword = async (newPassword) => {
    if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        return true;
    }
    throw new Error("No authenticated user");
};
