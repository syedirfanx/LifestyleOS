import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmHtfQUNj5mUfQ5kHPtgBn0LF5N5J99Jg",
  authDomain: "qx-lifestyleos.firebaseapp.com",
  projectId: "qx-lifestyleos",
  storageBucket: "qx-lifestyleos.firebasestorage.app",
  messagingSenderId: "431219288818",
  appId: "1:431219288818:web:8d1a358f46e0208e47be6b",
  measurementId: "G-6BE3SG4C67"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
