import React, { useContext, useState, useEffect, createContext } from 'react';
import { mentorAuth, mentorGoogleProvider, mentorDb } from '../firebaseMentor';
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
import { doc, setDoc, getDoc } from 'firebase/firestore';

const MentorAuthContext = createContext();

export function useMentorAuth() {
  return useContext(MentorAuthContext);
}

export function MentorAuthProvider({ children }) {
  const [currentMentor, setCurrentMentor] = useState(null);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMockAuth, setIsMockAuth] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(mentorAuth, async (user) => {
      if (user) {
        setCurrentMentor(user);
        // Fetch profile from Mentor DB
        try {
            const docRef = doc(mentorDb, 'mentors', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setMentorProfile(docSnap.data());
            }
        } catch (e) {
            console.error("Failed to fetch mentor profile", e);
        }
      } else {
        setCurrentMentor(null);
        setMentorProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signup(email, password, name, phone) {
    try {
      const userCredential = await createUserWithEmailAndPassword(mentorAuth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create mentor profile in Mentor DB
      const profileData = {
          uid: userCredential.user.uid,
          name, 
          email, 
          phone, 
          role: 'mentor',
          createdAt: new Date().toISOString()
      };
      await setDoc(doc(mentorDb, 'mentors', userCredential.user.uid), profileData);
      setMentorProfile(profileData);
      
      return userCredential;
    } catch (error) {
        if (error.code === 'auth/configuration-not-found' || error.message.includes('configuration')) {
            console.warn("Mentor Auth failed (Config). Using Mock.", error);
            const mockMentor = { uid: 'mock-mentor-'+Date.now(), email, displayName: name, role: 'mentor' };
            setCurrentMentor(mockMentor);
            setMentorProfile(mockMentor);
            setIsMockAuth(true);
            return { user: mockMentor };
        }
        throw error;
    }
  }

  async function login(email, password) {
    try {
        const result = await signInWithEmailAndPassword(mentorAuth, email, password);
        return result;
    } catch (error) {
        if (error.code === 'auth/configuration-not-found' || error.message.includes('configuration')) {
            console.warn("Mentor Auth failed (Config). Using Mock.", error);
            const mockMentor = { uid: 'mock-mentor-login', email, displayName: 'Mock Mentor', role: 'mentor' };
            setCurrentMentor(mockMentor);
            setMentorProfile(mockMentor);
            setIsMockAuth(true);
            return { user: mockMentor };
        }
        throw error;
    }
  }

  async function googleSignIn() {
      try {
          const result = await signInWithPopup(mentorAuth, mentorGoogleProvider);
          // Check/Create profile
          const docRef = doc(mentorDb, 'mentors', result.user.uid);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
              const profileData = {
                  uid: result.user.uid,
                  name: result.user.displayName,
                  email: result.user.email,
                  photoUrl: result.user.photoURL,
                  role: 'mentor',
                  createdAt: new Date().toISOString()
              };
              await setDoc(docRef, profileData);
              setMentorProfile(profileData);
          } else {
              setMentorProfile(docSnap.data());
          }
          return result;
      } catch (error) {
          console.error("Mentor Google Sign In Error", error);
          throw error;
      }
  }

  function setupRecaptcha(elementId) {
      if (!window.recaptchaVerifierMentor) {
          window.recaptchaVerifierMentor = new RecaptchaVerifier(mentorAuth, elementId, {
              'size': 'invisible',
              'callback': () => console.log("Mentor Recaptcha Verified")
          });
      }
      return window.recaptchaVerifierMentor;
  }

  async function loginWithPhone(phoneNumber, appVerifier) {
      return await signInWithPhoneNumber(mentorAuth, phoneNumber, appVerifier);
  }

  function logout() {
      if (isMockAuth) {
          setCurrentMentor(null);
          setMentorProfile(null);
          setIsMockAuth(false);
          return Promise.resolve();
      }
      return signOut(mentorAuth);
  }

  const value = {
    currentMentor,
    mentorProfile,
    signup,
    login,
    logout,
    googleSignIn,
    setupRecaptcha,
    loginWithPhone,
    loading
  };

  return (
    <MentorAuthContext.Provider value={value}>
      {!loading && children}
    </MentorAuthContext.Provider>
  );
}
