import { auth, signInWithEmailAndPassword } from "./firebase.js"; // Import necessary functions

document.getElementById("signin-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMessage = document.getElementById("error-message");
  const successMessage = document.getElementById("success-message");
  const loadingSpinner = document.getElementById("loading-spinner");

  // Show spinner and hide previous messages
  loadingSpinner.style.display = "flex";
  errorMessage.style.display = "none";
  successMessage.style.display = "none"; // Hide success message if it's visible

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    successMessage.textContent = "Login successful! Redirecting...";
    successMessage.style.display = "block"; // Show success message
    setTimeout(() => {
      window.location.href = "./dashBoard/dashboard.html"; // Redirect to dashboard after a delay
    }, 1500); // Delay redirect to allow user to see the success message
  } catch (error) {
    errorMessage.textContent = "Invalid email or password.";
    errorMessage.style.display = "block"; // Show error message if login fails
  } finally {
    // Hide spinner once login attempt is complete
    loadingSpinner.style.display = "none";
  }
});
