
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Firebase configuration.
 * The API key is obtained from the environment variable process.env.API_KEY as per guidelines.
 * Note: For a production app, the projectId, authDomain, etc., must match the project 
 * associated with the API key.
 */
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "ai-voice-mock-interviewer.firebaseapp.com",
  projectId: "ai-voice-mock-interviewer",
  storageBucket: "ai-voice-mock-interviewer.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:mockappid0001"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
