import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { getTeacherProfile } from "./services/tutorhubTeachers";
import { getStudentProfile, getTutorhubUser } from "./services/tutorhubUsers";
import { getWallet } from "./services/tutorhubWallet";
import s from "./Tutorhub.module.scss";

export default function Tutorhub() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.currentUser);

  const [scrollY, setScrollY] = useState(0);
  const [balance, setBalance] = useState(0);
  const [roleMessage, setRoleMessage] = useState("");
  const [checkingRole, setCheckingRole] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    setScrollY(window.scrollY);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setBalance(0);
      return;
    }

    getWallet(user.id)
      .then((wallet) => setBalance(wallet.balance))
      .catch(() => setBalance(0));
  }, [user]);

  async function startAsStudent() {
    setRoleMessage("");

    if (!user) {
      navigate("/account");
      return;
    }

    setCheckingRole(true);

    try {
      const [tutorhubUser, studentProfile, teacherProfile] = await Promise.all([
        getTutorhubUser(user.id),
        getStudentProfile(user.id),
        getTeacherProfile(user.id),
      ]);

      const isTeacherAccount = tutorhubUser?.role === "teacher" || Boolean(teacherProfile);

      if (isTeacherAccount) {
        setRoleMessage("Dieses Konto ist bereits als Lehrer registriert. Du kannst nicht zusaetzlich Schueler werden.");
        navigate("/Tutorhub/main");
        return;
      }

      if (!studentProfile) {
        navigate("/Tutorhub/student-setup");
        return;
      }

      if (studentProfile.profileStatus === "rejected") {
        navigate("/Tutorhub/student-setup");
        return;
      }

      navigate("/Tutorhub/main");
    } catch (err) {
      console.error(err);
      setRoleMessage("TutorHub-Status konnte nicht geladen werden.");
      navigate("/Tutorhub/main");
    } finally {
      setCheckingRole(false);
    }
  }

  async function startAsTeacher() {
    setRoleMessage("");

    if (!user) {
      navigate("/account");
      return;
    }

    setCheckingRole(true);

    try {
      const [tutorhubUser, studentProfile, teacherProfile] = await Promise.all([
        getTutorhubUser(user.id),
        getStudentProfile(user.id),
        getTeacherProfile(user.id),
      ]);

      const isStudentAccount = tutorhubUser?.role === "student" || Boolean(studentProfile);

      if (isStudentAccount) {
        setRoleMessage("Dieses Konto ist bereits als Schueler registriert. Du kannst nicht zusaetzlich Lehrer werden.");
        navigate("/Tutorhub/main");
        return;
      }

      if (!teacherProfile) {
        navigate("/Tutorhub/teacher-setup");
        return;
      }

      if (teacherProfile.status === "rejected") {
        navigate("/Tutorhub/teacher-setup");
        return;
      }

      navigate("/Tutorhub/main");
    } catch (err) {
      console.error(err);
      setRoleMessage("TutorHub-Status konnte nicht geladen werden.");
      navigate("/Tutorhub/main");
    } finally {
      setCheckingRole(false);
    }
  }

  const progress = Math.min(Math.max(scrollY, 0), 800) / 800;

  const textOpacity = progress;
  const detailsMove = progress * 90;
  const detailsOpacity = 1 - progress * 0.6;

  const yellowX = progress * -360;
  const yellowY = progress * 620;
  const yellowRotate = -4 + progress * 4;

  const pinkX = 0;
  const pinkY = progress * 620;
  const pinkRotate = 2 - progress * 2;

  const purpleX = progress * 360;
  const purpleY = progress * 620;
  const purpleRotate = 4 - progress * 4;

  return (
    <div className={s.container}>
      <header className={s.header}>
        <div className={s.logo}>TutorHub</div>

        <nav className={s.nav}>
          <a href="#">Events</a>
          <a href="#">Workshops</a>
          <a href="#">Pricing</a>
          <a href="#">About us</a>
          <a href="#">Contact</a>
        </nav>

        <div className={s.actions}>
          <div className={s.walletBadge}>
            <span>Guthaben</span>
            <strong>{balance} Credits</strong>
          </div>
        </div>
      </header>

      <div className={s.hero}>
        <h1>
          Maximize Your Social
          <br />
          Media Presence
        </h1>

        <div className={s.heroButtons}>
          <button
            className={s.purpleBtn}
            type="button"
            onClick={startAsStudent}
            disabled={checkingRole}
          >
            {checkingRole ? "Pruefen..." : "Starten als Schueler"}
          </button>
          <button
            className={s.whiteBtn}
            type="button"
            onClick={startAsTeacher}
            disabled={checkingRole}
          >
            {checkingRole ? "Pruefen..." : "Starten als Lehrer"}
          </button>
        </div>

        {roleMessage && (
          <p style={{ marginTop: 14, color: "#b42318", fontWeight: 800 }}>
            {roleMessage}
          </p>
        )}
      </div>

      <div className={s.cardsWrapper}>
        <div className={s.cards}>
          <div
            className={`${s.card} ${s.yellow}`}
            style={{
              transform: `
                translate(${yellowX}px, ${yellowY}px)
                rotate(${yellowRotate}deg)
              `,
            }}
          >
            <div
              className={s.cardText}
              style={{
                opacity: textOpacity,
                transform: `translateY(${20 - progress * 20}px)`,
              }}
            >
              <h3>Erfahrene Tutoren</h3>
              <p>
                Unsere Tutorinnen und Tutoren sind Studierende, die selbst erfolgreich
                an unserer DSD Schule gelernt haben.
              </p>
            </div>
          </div>

          <div
            className={`${s.card} ${s.pink}`}
            style={{
              transform: `
                translate(${pinkX}px, ${pinkY}px)
                rotate(${pinkRotate}deg)
              `,
            }}
          >
            <div
              className={s.cardText}
              style={{
                opacity: textOpacity,
                transform: `translateY(${20 - progress * 20}px)`,
              }}
            >
              <h3>Persoenliche Foerderung</h3>
              <p>
                Ob Einzel- oder Gruppenunterricht, unsere erfahrenen Tutorinnen und
                Tutoren helfen dir, deine Ziele zu erreichen.
              </p>
            </div>
          </div>

          <div
            className={`${s.card} ${s.purple}`}
            style={{
              transform: `
                translate(${purpleX}px, ${purpleY}px)
                rotate(${purpleRotate}deg)
              `,
            }}
          >
            <div
              className={s.bigCircle}
              style={{
                opacity: detailsOpacity,
                transform: `translate(${-detailsMove}px, ${detailsMove * 0.2}px)`,
              }}
            />

            <div
              className={s.eye}
              style={{
                opacity: detailsOpacity,
                transform: `translate(${-detailsMove * 0.4}px, ${detailsMove * 0.3}px)`,
              }}
            />

            <div
              className={s.smallCircle}
              style={{
                opacity: detailsOpacity,
                transform: `translate(${detailsMove * 0.5}px, ${-detailsMove * 0.2}px)`,
              }}
            />

            <div
              className={s.orange}
              style={{
                opacity: detailsOpacity,
                transform: `translate(${detailsMove}px, ${detailsMove * 0.1}px) rotate(35deg)`,
              }}
            />

            <div
              className={s.heart}
              style={{
                opacity: detailsOpacity,
                transform: `translate(${detailsMove}px, ${-detailsMove * 0.5}px) rotate(-45deg)`,
              }}
            />

            <div
              className={s.line}
              style={{
                opacity: detailsOpacity,
                transform: `translate(${-detailsMove * 0.7}px, ${detailsMove * 0.4}px) rotate(12deg)`,
              }}
            />

            <div
              className={s.cardText}
              style={{
                opacity: textOpacity,
                transform: `translateY(${20 - progress * 20}px)`,
              }}
            >
              <h3>Gemeinsam zum Erfolg</h3>
              <p>
                Wir helfen Schuelerinnen und Schuelern, Wissen aufzubauen,
                Selbstvertrauen zu staerken und bessere Ergebnisse zu erzielen.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className={s.fakeSection}>
        <h2>Naechster Bereich</h2>
      </section>
    </div>
  );
}