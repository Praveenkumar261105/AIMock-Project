import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  // The system automatically injects the valid key into process.env.API_KEY
  apiKey: process.env.API_KEY,
  authDomain: "ai-mock-870d0.firebaseapp.com",
  projectId: "ai-mock-870d0",
  storageBucket: "ai-mock-870d0.firebasestorage.app",
  messagingSenderId: "554078013477",
  appId: "1:554078013477:web:e2cf839cc69ea03812d7cc",
  measurementId: "G-Z21J0Y41L4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
