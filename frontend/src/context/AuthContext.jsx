import React, { useContext, useState, useEffect, createContext } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { createUserProfile, getUserProfile, updateUserPoints } from '../services/userService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMockAuth, setIsMockAuth] = useState(false);
  const [isMentor, setIsMentor] = useState(false);

  // Sync user profile when currentUser changes
  useEffect(() => {
    async function fetchProfile() {
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
        
        // Check if mentor
        if (profile?.role === 'mentor') {
            setIsMentor(true);
        } else if (isMockAuth && currentUser.email?.includes('mentor')) {
            setIsMentor(true);
        } else {
            try {
                const mentorDoc = await getDoc(doc(db, 'mentors', currentUser.uid));
                if (mentorDoc.exists()) {
                    setIsMentor(true);
                } else {
                    setIsMentor(false);
                }
            } catch (e) {
                console.warn("Mentor check failed (likely mock mode)", e);
                setIsMentor(false);
            }
        }
      } else {
        setUserProfile(null);
        setIsMentor(false);
      }
    }
    fetchProfile();
  }, [currentUser, isMockAuth]);

  function setupRecaptcha(elementId) {
      if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
              'size': 'invisible',
              'callback': (response) => {
                  // reCAPTCHA solved, allow signInWithPhoneNumber.
                  console.log("Recaptcha Verified");
              }
          });
      }
      return window.recaptchaVerifier;
  }

  async function loginWithPhone(phoneNumber, appVerifier) {
      try {
          const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
          window.confirmationResult = confirmationResult;
          return confirmationResult;
      } catch (error) {
          console.error("Phone Auth Error:", error);
          throw error;
      }
  }

  async function verifyOtp(otp) {
      if (!window.confirmationResult) throw new Error("No OTP request found.");
      const result = await window.confirmationResult.confirm(otp);
      return result.user;
  }

  async function signup(email, password, name, phone) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      // Create user profile in DB
      await createUserProfile(userCredential.user.uid, { name, email, phone, role: 'student', points: 0 });
      return userCredential;
    } catch (error) {
      // Fallback for demo/invalid config
      if (error.code === 'auth/configuration-not-found' || error.code === 'auth/network-request-failed' || error.message.includes('configuration')) {
        console.warn("Firebase Auth failed. Falling back to Mock Auth.", error);
        const mockUser = {
          uid: 'mock-user-' + Date.now(),
          email: email,
          displayName: name,
          phoneNumber: phone,
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
          emailVerified: true
        };
        // Mock DB Create
        await createUserProfile(mockUser.uid, { name, email, phone, role: 'student', points: 0 });
        
        setIsMockAuth(true);
        setCurrentUser(mockUser);
        return { user: mockUser };
      }
      throw error;
    }
  }

  // Mentor Signup
  async function signupAsMentor(email, password, name, phone) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      // Create user profile in DB with role 'mentor'
      await createUserProfile(userCredential.user.uid, { name, email, phone, role: 'mentor', points: 0 });
      return userCredential;
    } catch (error) {
        // Mock Fallback
        if (error.code === 'auth/configuration-not-found' || error.code === 'auth/network-request-failed' || error.message.includes('configuration')) {
            console.warn("Firebase Auth failed. Falling back to Mock Mentor Auth.", error);
            const mockMentor = {
                uid: 'mock-mentor-' + Date.now(),
                email: email,
                displayName: name,
                phoneNumber: phone,
                photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                emailVerified: true
            };
            await createUserProfile(mockMentor.uid, { name, email, phone, role: 'mentor', points: 0 });
            setIsMockAuth(true);
            setCurrentUser(mockMentor);
            setIsMentor(true);
            return { user: mockMentor };
        }
        throw error;
      }
  }

  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(result.user.uid);
      return { user: result.user, profile };
    } catch (error) {
       // Fallback for demo/invalid config
       if (error.code === 'auth/configuration-not-found' || error.code === 'auth/network-request-failed' || error.message.includes('configuration')) {
        console.warn("Firebase Auth failed. Falling back to Mock Auth.", error);
        const mockUser = {
          uid: 'mock-user-login',
          email: email,
          displayName: "Demo User",
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=Demo`,
          emailVerified: true
        };
        await createUserProfile(mockUser.uid, { name: "Demo User", email, role: 'student' });

        setIsMockAuth(true);
        setCurrentUser(mockUser);
        const profile = await getUserProfile(mockUser.uid);
        return { user: mockUser, profile };
      }
      throw error;
    }
  }

  async function loginAsMentor(email, password) {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const profile = await getUserProfile(result.user.uid);
        return { user: result.user, profile };
      } catch (error) {
        if (error.code === 'auth/configuration-not-found' || error.code === 'auth/network-request-failed' || error.message.includes('configuration')) {
            console.warn("Firebase Auth failed. Falling back to Mock Mentor Auth.", error);
            const mockMentor = {
                uid: 'mock-mentor-1',
                email: email,
                displayName: "Mock Mentor",
                photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=Mentor`,
                emailVerified: true
            };
            await createUserProfile(mockMentor.uid, { name: "Mock Mentor", email, role: 'mentor' });
            
            setIsMockAuth(true);
            setCurrentUser(mockMentor);
            setIsMentor(true);
            const profile = await getUserProfile(mockMentor.uid);
            return { user: mockMentor, profile };
        }
        throw error;
      }
  }

  async function googleSignIn() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      let profile = await getUserProfile(result.user.uid);
      if (!profile) {
          await createUserProfile(result.user.uid, { 
              name: result.user.displayName, 
              email: result.user.email,
              photoUrl: result.user.photoURL,
              role: 'student',
              points: 0
          });
          profile = await getUserProfile(result.user.uid);
      }
      return { user: result.user, profile };
    } catch (error) {
       // Fallback for demo/invalid config
       if (error.code === 'auth/configuration-not-found' || error.code === 'auth/network-request-failed' || error.message.includes('configuration')) {
        console.warn("Firebase Auth failed. Falling back to Mock Auth.", error);
         const mockUser = {
          uid: 'mock-user-google',
          email: "google-demo@example.com",
          displayName: "Google Demo User",
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=Google`,
          emailVerified: true
        };
        await createUserProfile(mockUser.uid, { name: "Google Demo User", email: "google-demo@example.com", role: 'student', points: 0 });
        setIsMockAuth(true);
        setCurrentUser(mockUser);
        const profile = await getUserProfile(mockUser.uid);
        return { user: mockUser, profile };
      }
      throw error;
    }
  }

  function logout() {
    if (isMockAuth) {
      setCurrentUser(null);
      setUserProfile(null);
      setIsMentor(false);
      setIsMockAuth(false);
      return Promise.resolve();
    }
    return signOut(auth);
  }

  // Points System Helper
  async function awardPoints(amount) {
    if (currentUser) {
       const newPoints = (userProfile?.points || 0) + amount;
       setUserProfile(prev => ({ ...prev, points: newPoints })); // Optimistic update
       await updateUserPoints(currentUser.uid, newPoints);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isMockAuth) {
        setCurrentUser(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isMockAuth]);

  const value = {
    currentUser,
    userProfile,
    isMentor,
    signup,
    signupAsMentor,
    login,
    loginAsMentor,
    logout,
    googleSignIn,
    setupRecaptcha,
    loginWithPhone,
    verifyOtp,
    loading,
    awardPoints // Exported
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div id="auth-loading" className="flex items-center justify-center min-h-screen">Loading Auth...</div> : children}
    </AuthContext.Provider>
  );
}
