import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB2USSxqJVljgv4NCPFnPIz1LuH7fNt8Is",
  authDomain: "dynamic-reef-6q6d2.firebaseapp.com",
  projectId: "dynamic-reef-6q6d2",
  storageBucket: "dynamic-reef-6q6d2.firebasestorage.app",
  messagingSenderId: "871913049116",
  appId: "1:871913049116:web:2f435c37023833c32ca3d9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
