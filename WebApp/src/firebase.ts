// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDiovhAE0fMBC9BYTc0qnUd9h9KbkDnCcI",
  authDomain: "dehub-349de.firebaseapp.com",
  projectId: "dehub-349de",
  storageBucket: "dehub-349de.firebasestorage.app",
  messagingSenderId: "606576290083",
  appId: "1:606576290083:web:3f03cbe057f359c4b00496",
  measurementId: "G-Q315BQNCNR",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// 👇 Provider vorbereiten
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
