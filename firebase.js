import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGIicDXgC4-GhhlaFrFKtN-31HyQbAvk4",
  authDomain: "raspapa-3aab0.firebaseapp.com",
  projectId: "raspapa-3aab0",
  storageBucket: "raspapa-3aab0.firebasestorage.app",
  messagingSenderId: "739010939510",
  appId: "1:739010939510:web:86b97f7f92562c5cf36d57",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Export Auth and Firestore methods
export {
  auth,
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
};
