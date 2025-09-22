// src/pages/Account/Account.tsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { auth, googleProvider, githubProvider, facebookProvider, db } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import s from "./account.module.scss";
import GoogleIcon from "../../assets/GoogleIcon.png";
import GithubIcon from "../../assets/GithubIcon.png";
import FacebookIcon from "../../assets/FacebookIcon.png";


const Account: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.currentUser);

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔑 Registrierung
  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return alert("Bitte Name, Email und Passwort eingeben!");
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Profilname setzen
      await updateProfile(cred.user, { displayName: name });

      // Name + Email zusätzlich in Firestore speichern
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name,
        email,
      });
    } catch (err: any) {
      alert("Fehler bei der Registrierung: " + err.message);
    }
  };

  // 🔑 Login
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return alert("Bitte Email und Passwort eingeben!");
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      alert("Fehler beim Login: " + err.message);
    }
  };

  // 🔑 Social Logins
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google Login Fehler:", err);
    }
  };

  const handleGithubLogin = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (err) {
      console.error("GitHub Login Fehler:", err);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
    } catch (err) {
      console.error("Facebook Login Fehler:", err);
    }
  };

  // 🔑 Logout
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className={s.accountPage}>
      <h1>Mein Konto</h1>

      {user ? (
        <>
          <div className={s.welcomeMessage}>
            Willkommen, {user.displayName || user.email}!
          </div>
          <div className={s.formContainer}>
            <button onClick={handleLogout}>Abmelden</button>
          </div>
        </>
      ) : (
        <div className={s.formContainer}>
          {isRegister && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {isRegister ? (
            <button onClick={handleRegister}>Registrieren</button>
          ) : (
            <button onClick={handleLogin}>Anmelden</button>
          )}

          <button
            className="secondaryButton"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister
              ? "Schon ein Konto? Hier anmelden"
              : "Noch kein Konto? Jetzt registrieren"}
          </button>

          <hr />
          <div className={s.socialLogin}>
            <button className={s.socialButton} onClick={handleGoogleLogin}>
              <img src={GoogleIcon} alt="Google" />
            </button>
            <button className={s.socialButton} onClick={handleGithubLogin}>
              <img src={GithubIcon} alt="GitHub" />
           </button>
           <button className={s.socialButton} onClick={handleFacebookLogin}>
             <img src={FacebookIcon} alt="Facebook" />
           </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
