import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import {
  auth,
  googleProvider,
  githubProvider,
  facebookProvider,
  db,
} from "../../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  applyActionCode,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import s from "./account.module.scss";
import GoogleIcon from "../../assets/GoogleIcon.png";
import GithubIcon from "../../assets/GithubIcon.png";
import FacebookIcon from "../../assets/FacebookIcon.png";

const Account: React.FC = () => {
  const reduxUser = useSelector((state: RootState) => state.user.currentUser);
  const [localUser, setLocalUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const currentUser = reduxUser || localUser;

  // --- Проверка E-Mail подтверждения из ссылки ---
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const mode = query.get("mode");
    const oobCode = query.get("oobCode");

    if (mode === "verifyEmail" && oobCode) {
      (async () => {
        try {
          await applyActionCode(auth, oobCode);
          await auth.currentUser?.reload();
          setMessage("✅ Deine E-Mail wurde erfolgreich bestätigt!");

          const tempEmail = localStorage.getItem("tempEmail");
          const tempPassword = localStorage.getItem("tempPassword");

          if (tempEmail && tempPassword) {
            try {
              const cred = await signInWithEmailAndPassword(
                auth,
                tempEmail,
                tempPassword
              );
              if (cred.user.emailVerified) {
                setLocalUser({
                  email: cred.user.email,
                  displayName: cred.user.displayName,
                });
                setUserName(cred.user.displayName || "");
                setMessage(
                  "🎉 Verifizierung erfolgreich! Du bist jetzt eingeloggt."
                );
                localStorage.removeItem("tempEmail");
                localStorage.removeItem("tempPassword");
              }
            } catch {
              setMessage("✅ E-Mail bestätigt! Du kannst dich jetzt anmelden.");
            }
          }
        } catch (err: any) {
          setMessage("❌ Fehler bei der Bestätigung: " + err.message);
        }
      })();
    }
  }, []);

  // --- Регистрация ---
  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return setMessage("⚠️ Bitte gib Name, E-Mail und Passwort ein!");
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      localStorage.setItem("tempEmail", email);
      localStorage.setItem("tempPassword", password);

      await updateProfile(cred.user, { displayName: name });
      await sendEmailVerification(cred.user);

      setMessage(
        "📩 Wir haben dir eine E-Mail geschickt. Bitte bestätige deine Adresse, bevor du dich einloggst."
      );

      await signOut(auth);
    } catch (err: any) {
      setMessage("❌ Fehler bei der Registrierung: " + err.message);
    }
  };

  // --- Логин ---
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return setMessage("⚠️ Bitte gib deine E-Mail und dein Passwort ein!");
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      if (!cred.user.emailVerified) {
        await signOut(auth);
        return setMessage("📨 Bitte bestätige zuerst deine E-Mail-Adresse!");
      }

      const userRef = doc(db, "users", cred.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: cred.user.uid,
          name: cred.user.displayName || name,
          email: cred.user.email,
          verified: true,
          createdAt: new Date().toISOString(),
        });
      }

      setLocalUser({
        email: cred.user.email,
        displayName: cred.user.displayName,
      });
      setUserName(cred.user.displayName || name);
      setMessage("✅ Login erfolgreich!");
    } catch (err: any) {
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password"
      ) {
        setMessage("❌ E-Mail oder Passwort ist falsch.");
      } else {
        setMessage("❌ Fehler beim Login: " + err.message);
      }
    }
  };

  // --- Сброс пароля ---
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      return setMessage("⚠️ Bitte gib deine E-Mail ein.");
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("📬 Link zum Zurücksetzen wurde gesendet!");
    } catch (err: any) {
      setMessage("❌ Fehler: " + err.message);
    }
  };

  // --- Социальные логины ---
  const handleGoogleLogin = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      setLocalUser({
        email: cred.user.email,
        displayName: cred.user.displayName,
      });
      setUserName(cred.user.displayName || "");
      setMessage("✅ Erfolgreich über Google eingeloggt!");
    } catch (err: any) {
      setMessage("❌ Google-Login fehlgeschlagen: " + err.message);
    }
  };

  const handleGithubLogin = async () => {
    try {
      const cred = await signInWithPopup(auth, githubProvider);
      setLocalUser({
        email: cred.user.email,
        displayName: cred.user.displayName,
      });
      setUserName(cred.user.displayName || "");
      setMessage("✅ Erfolgreich über GitHub eingeloggt!");
    } catch (err: any) {
      setMessage("❌ GitHub-Login fehlgeschlagen: " + err.message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const cred = await signInWithPopup(auth, facebookProvider);
      setLocalUser({
        email: cred.user.email,
        displayName: cred.user.displayName,
      });
      setUserName(cred.user.displayName || "");
      setMessage("✅ Erfolgreich über Facebook eingeloggt!");
    } catch (err: any) {
      setMessage("❌ Facebook-Login fehlgeschlagen: " + err.message);
    }
  };

  // --- Logout ---
  const handleLogout = async () => {
    await signOut(auth);
    setLocalUser(null);
    setUserName("");
    setMessage("👋 Du wurdest abgemeldet.");
  };

  return (
    <div className={s.accountPage}>
      <h1>Mein Konto</h1>

      {message && (
        <div
          style={{
            background: "#eef3ff",
            border: "1px solid #b0c4ff",
            color: "#222",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "15px",
            textAlign: "center",
            whiteSpace: "pre-line",
          }}
        >
          {message}
        </div>
      )}

      {currentUser ? (
        <div
          style={{
            background: "#f8faff",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            textAlign: "center",
            marginTop: "40px",
          }}
        >
          <p style={{ fontSize: "20px", marginBottom: "30px", color: "#333" }}>
            Willkommen,{" "}
            <b>
              {currentUser.displayName ||
                userName ||
                currentUser.email ||
                "Имя пользователя"}
            </b>
            !
          </p>
          <button
            onClick={handleLogout}
            style={{
              background: "#e53935",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 24px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              transition: "0.2s",
            }}
          >
            Abmelden
          </button>
        </div>
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
            placeholder="E-Mail"
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

          {!isRegister && (
            <button
              onClick={handleForgotPassword}
              style={{
                background: "transparent",
                border: "none",
                color: "#007bff",
                cursor: "pointer",
                marginTop: "8px",
                textDecoration: "underline",
              }}
            >
              Passwort vergessen?
            </button>
          )}

          <button
            className="secondaryButton"
            onClick={() => {
              setMessage(null);
              setIsRegister(!isRegister);
            }}
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
