import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDmHtfQUNj5mUfQ5kHPtgBn0LF5N5J99Jg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "qx-lifestyleos.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "qx-lifestyleos",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "qx-lifestyleos.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "431219288818",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:431219288818:web:8d1a358f46e0208e47be6b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6BE3SG4C67"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
