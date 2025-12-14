import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBz87WIUXi--Jt7_HZU7OxsnbjbEEXjXCE",
  authDomain: "mentor-dashboard-25652.firebaseapp.com",
  projectId: "mentor-dashboard-25652",
  storageBucket: "mentor-dashboard-25652.firebasestorage.app",
  messagingSenderId: "809362882440",
  appId: "1:809362882440:web:a2e899c829d2c29e75843d",
  measurementId: "G-JP60PGRWQR"
};

// Initialize Firebase (Secondary App)
const app = initializeApp(firebaseConfig, "mentorApp");

// Initialize Authentication
export const mentorAuth = getAuth(app);
export const mentorGoogleProvider = new GoogleAuthProvider();

// Initialize Database
export const mentorDb = getFirestore(app);

// Initialize Storage
export const mentorStorage = getStorage(app);

// Initialize Analytics (optional)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export default app;
