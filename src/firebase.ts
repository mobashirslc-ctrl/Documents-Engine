import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC6JHRDsJoVFMM4_8RScyEQVwqQcaTL0-k",
  authDomain: "documents-engine.firebaseapp.com",
  projectId: "documents-engine",
  storageBucket: "documents-engine.firebasestorage.app",
  messagingSenderId: "191265618348",
  appId: "1:191265618348:web:4757f920c838bbc2312209",
  measurementId: "G-G431582M41"
};

const app = initializeApp(firebaseConfig);

// EXPORTগুলো ঠিক এভাবে থাকতে হবে:
export const db = getFirestore(app);
export const storage = getStorage(app);