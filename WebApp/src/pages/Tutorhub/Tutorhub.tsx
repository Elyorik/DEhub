import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { getWallet } from "./services/tutorhubWallet";
import s from "./Tutorhub.module.scss";

export default function Tutorhub() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.currentUser);

  const [scrollY, setScrollY] = useState(0);
  const [balance, setBalance] = useState(0);

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
      .catch(console.error);
  }, [user]);

  function startAsStudent() {
    if (!user) {
      navigate("/account");
      return;
    }

    navigate("/Tutorhub/student-setup");
  }

  function startAsTeacher() {
    if (!user) {
      navigate("/account");
      return;
    }

    navigate("/Tutorhub/teacher-setup");
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
          <button className={s.purpleBtn} type="button" onClick={startAsStudent}>
            Starten als Schueler
          </button>
          <button className={s.whiteBtn} type="button" onClick={startAsTeacher}>
            Starten als Lehrer
          </button>
        </div>
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
              <h3>Persönliche Förderung</h3>
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
                Wir helfen Schülerinnen und Schülern, Wissen aufzubauen,
                Selbstvertrauen zu stärken und bessere Ergebnisse zu erzielen.
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