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
  remove
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxF_uCmFgNlVaCXYa80zCDBlJiB9PSFyw",
  authDomain: "rashailu-gym.firebaseapp.com",
  databaseURL: "https://rashailu-gym-default-rtdb.firebaseio.com",
  projectId: "rashailu-gym",
  storageBucket: "rashailu-gym.firebasestorage.app",
  messagingSenderId: "965173384064",
  appId: "1:965173384064:web:a8ae46979c06f9f0e8e765",
  measurementId: "G-R938ZL5YMS",
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
