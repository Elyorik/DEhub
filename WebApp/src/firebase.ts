// src/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDiovhAE0fMBC9BYTc0qnUd9h9KbkDnCcI",
  authDomain: "dehub-349de.firebaseapp.com",
  projectId: "dehub-349de",
  storageBucket: "dehub-349de.appspot.com",
  messagingSenderId: "606576290083",
  appId: "1:606576290083:web:3f03cbe057f359c4b00496",
  measurementId: "G-Q315BQNCNR",
};

// 🔥 Firebase App initialisieren
const app = initializeApp(firebaseConfig);

// 📦 Firebase Dienste
export const auth = getAuth(app);
export const db = getFirestore(app);

// 🌐 Provider für Social Logins
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// 📩 Einstellungen für E-Mail-Link-Verifizierung
export const actionCodeSettings = {
  url: "https://dehub.vercel.app/verify",
  handleCodeInApp: true,
};

// ✅ Добавь это в самый конец:
export { app };
