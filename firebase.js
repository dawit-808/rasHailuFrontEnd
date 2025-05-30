import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js"; // Import auth methods

import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update,
  push,
  remove,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGIicDXgC4-GhhlaFrFKtN-31HyQbAvk4",
  authDomain: "raspapa-3aab0.firebaseapp.com",
  databaseURL: "https://raspapa-3aab0-default-rtdb.firebaseio.com",
  projectId: "raspapa-3aab0",
  storageBucket: "raspapa-3aab0.firebasestorage.app",
  messagingSenderId: "739010939510",
  appId: "1:739010939510:web:86b97f7f92562c5cf36d57",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Database
const auth = getAuth(app);
const db = getDatabase(app);

// Export the necessary functions for use in other files
export {
  auth,
  db,
  ref,
  set,
  get,
  onValue,
  update,
  push,
  remove,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
};
