
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-61285.firebaseapp.com",
  projectId: "reactchat-61285",
  storageBucket: "reactchat-61285.firebasestorage.app",
  messagingSenderId: "572750138025",
  appId: "1:572750138025:web:f8a8be0df12f8404ad37b8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()