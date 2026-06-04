import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import s from "./TutorhubMain.module.scss";

export default function TutorhubMain() {
  const user = useSelector((state: RootState) => state.user.currentUser);

  return (
    <section className={s.page}>
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub</p>
        <h1>Willkommen{user?.name ? `, ${user.name}` : ""}</h1>
        <p>
          Hier startest du: Profil ausfuellen, passende Lehrer finden, Guthaben pruefen
          und deine Buchungen verwalten.
        </p>
      </div>

      <div className={s.grid}>
        <Link className={s.primaryCard} to="/Tutorhub/student-setup">
          <span>Schueler</span>
          <strong>Schueler-Infoblatt</strong>
          <p>Erzaehle, welche Faecher und Lernziele du hast.</p>
        </Link>

        <Link className={s.card} to="/Tutorhub/teacher-setup">
          <span>Lehrer</span>
          <strong>Lehrerprofil erstellen</strong>
          <p>Reiche dein Lehrerprofil ein und warte auf Freigabe.</p>
        </Link>

        <Link className={s.card} to="/Tutorhub/teachers">
          <span>Suchen</span>
          <strong>Lehrer suchen</strong>
          <p>Finde passende Lehrer nach Fach, Preis und Profil.</p>
        </Link>

        <Link className={s.card} to="/Tutorhub/wallet">
          <span>Wallet</span>
          <strong>Guthaben</strong>
          <p>Pruefe dein aktuelles Guthaben und spaeter deine Zahlungen.</p>
        </Link>

        <Link className={s.card} to="/Tutorhub/bookings">
          <span>Buchungen</span>
          <strong>Meine Buchungen</strong>
          <p>Sieh deine geplanten und abgeschlossenen Unterrichte.</p>
        </Link>
      </div>
    </section>
  );
}