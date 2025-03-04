// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnFcar0bCoVEStwn6htSQFzGlBcZc05y0",
  authDomain: "flashcards-8b15c.firebaseapp.com",
  projectId: "flashcards-8b15c",
  storageBucket: "flashcards-8b15c.firebasestorage.app",
  messagingSenderId: "296331117416",
  appId: "1:296331117416:web:986e1f2978d80567ee8cdd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle form submission
document.getElementById('signupForm').addEventListener('submit', (event) => {
  event.preventDefault();

  // Get input values
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;

  // Validate password match
  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  // Create user with Firebase
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up successfully
      const user = userCredential.user;
      alert('Account created successfully!');
      window.location.href = '/login.html'; // Redirect to login page
    })
    .catch((error) => {
      // Handle errors
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`Error: ${errorMessage}`);
    });
});