import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAqyrAugxU9Bj5RVOrSsLtOoPpE9LVxwsE",
  authDomain: "technosoft-elearning.firebaseapp.com",
  projectId: "technosoft-elearning",
  storageBucket: "technosoft-elearning.firebasestorage.app",
  messagingSenderId: "745639638690",
  appId: "1:745639638690:web:8ed11ce5803e399a1009fb", // Updated ID
  measurementId: "G-KJK988QK9N" // Updated Measurement ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Database
export const db = getFirestore(app);

// Initialize Analytics (optional, requires browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export default app;
