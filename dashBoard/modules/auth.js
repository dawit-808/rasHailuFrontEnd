// src/modules/auth.js
import { auth, signOut, onAuthStateChanged } from "../../firebase.js";

export function initializeAuth() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.body.style.display = "block";
    } else {
      window.location.href = "../../index.html";
    }
  });
}

export function setupLogout() {
  document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "../../index.html";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
}
