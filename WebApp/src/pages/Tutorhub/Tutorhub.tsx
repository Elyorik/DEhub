// Tutorhub.tsx
import s from "./tutorhub.module.scss";

export default function Tutorhub() {
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
            <button className={s.login}>Log in</button>
            <button className={s.blackBtn}>Starten</button>
          </div>
        </header>

        <div className={s.hero}>
          <h1>
            Maximize Your Social
            <br />
            Media Presence
          </h1>

          <div className={s.heroButtons}>
            <button className={s.purpleBtn}>Starten als Schüler</button>

            <button className={s.whiteBtn}>
              Starten als Lehrer
            </button>
          </div>
        </div>

        <div className={s.cards}>
          <div className={s.yellow}></div>

          <div className={s.pink}></div>

          <div className={s.purple}>
            <div className={s.bigCircle}></div>

            <div className={s.eye}></div>

            <div className={s.smallCircle}></div>

            <div className={s.orange}></div>

            <div className={s.heart}></div>

            <div className={s.line}></div>
          </div>
        </div>
      </div>
  );
}