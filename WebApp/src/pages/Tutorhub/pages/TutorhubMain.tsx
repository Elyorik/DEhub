import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import type { TeacherProfile } from "../models/tutorhubTeacher.model";
import type { StudentProfile, TutorhubUserProfile } from "../models/tutorhubUser.model";
import { getTeacherProfile } from "../services/tutorhubTeachers";
import { getStudentProfile, getTutorhubUser } from "../services/tutorhubUsers";
import s from "./TutorhubMain.module.scss";

type Status = "missing" | "pending" | "approved" | "rejected";

function getStudentStatus(profile: StudentProfile | null): Status {
  return profile?.profileStatus || "missing";
}

function getTeacherStatus(profile: TeacherProfile | null): Status {
  return profile?.status || "missing";
}

function getStatusLabel(status: Status) {
  if (status === "approved") return "Freigegeben";
  if (status === "pending") return "In Pruefung";
  if (status === "rejected") return "Abgelehnt";
  return "Nicht erstellt";
}

function getStatusText(status: Status, type: "student" | "teacher") {
  if (status === "approved") {
    return type === "student"
      ? "Dein Schuelerprofil ist freigegeben. Du kannst passende Lehrer suchen und Buchungen starten."
      : "Dein Lehrerprofil ist freigegeben. Es kann in der Lehrerliste erscheinen.";
  }

  if (status === "pending") {
    return "Deine Ankete wurde eingereicht und wartet auf Admin-Pruefung.";
  }

  if (status === "rejected") {
    return "Deine Ankete wurde abgelehnt. Bitte pruefe den Grund und reiche sie korrigiert erneut ein.";
  }

  return type === "student"
    ? "Fuellen dein Schuelerprofil aus, damit TutorHub passende Hilfe empfehlen kann."
    : "Erstelle dein Lehrerprofil, wenn du Unterricht anbieten moechtest.";
}

export default function TutorhubMain() {
  const user = useSelector((state: RootState) => state.user.currentUser);

  const [tutorhubUser, setTutorhubUser] = useState<TutorhubUserProfile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadProfiles() {
      if (!user) return;

      setLoading(true);
      setError("");

      try {
        const [appUser, student, teacher] = await Promise.all([
          getTutorhubUser(user.id),
          getStudentProfile(user.id),
          getTeacherProfile(user.id),
        ]);

        setTutorhubUser(appUser);
        setStudentProfile(student);
        setTeacherProfile(teacher);
      } catch (err) {
        console.error(err);
        setError("TutorHub-Daten konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }

    loadProfiles();
  }, [user]);

  const studentStatus = getStudentStatus(studentProfile);
  const teacherStatus = getTeacherStatus(teacherProfile);
  const hasApprovedStudent = studentStatus === "approved";
  const hasApprovedTeacher = teacherStatus === "approved";

  return (
    <section className={s.page}>
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub Dashboard</p>
        <h1>Willkommen{user?.name ? `, ${user.name}` : ""}</h1>
        <p>
          Hier siehst du deinen TutorHub-Status, deine naechsten Schritte und alle
          wichtigen Bereiche fuer Lernen, Unterrichten und Buchungen.
        </p>
      </div>

      {loading ? (
        <div className={s.stateBox}>TutorHub-Daten werden geladen...</div>
      ) : error ? (
        <div className={s.errorBox}>{error}</div>
      ) : (
        <>
          <div className={s.statusGrid}>
            <article className={s.statusCard}>
              <div className={s.statusTop}>
                <span>Schuelerprofil</span>
                <b className={s[studentStatus]}>{getStatusLabel(studentStatus)}</b>
              </div>

              <h2>{studentProfile?.name || "Als Schueler starten"}</h2>
              <p>{getStatusText(studentStatus, "student")}</p>

              {studentStatus === "rejected" && studentProfile?.rejectionReason && (
                <div className={s.reason}>
                  <strong>Grund:</strong>
                  <span>{studentProfile.rejectionReason}</span>
                </div>
              )}

              <div className={s.actions}>
                <Link to="/Tutorhub/student-setup">
                  {studentStatus === "missing" ? "Ankete ausfuellen" : "Ankete bearbeiten"}
                </Link>
                {studentStatus === "approved" && (
                  <Link to="/Tutorhub/teachers">Lehrer suchen</Link>
                )}
              </div>
            </article>

            <article className={s.statusCard}>
              <div className={s.statusTop}>
                <span>Lehrerprofil</span>
                <b className={s[teacherStatus]}>{getStatusLabel(teacherStatus)}</b>
              </div>

              <h2>{teacherProfile?.name || "Als Lehrer starten"}</h2>
              <p>{getStatusText(teacherStatus, "teacher")}</p>

              {teacherStatus === "rejected" && teacherProfile?.rejectionReason && (
                <div className={s.reason}>
                  <strong>Grund:</strong>
                  <span>{teacherProfile.rejectionReason}</span>
                </div>
              )}

              <div className={s.actions}>
                <Link to="/Tutorhub/teacher-setup">
                  {teacherStatus === "missing" ? "Profil erstellen" : "Profil bearbeiten"}
                </Link>
                {teacherStatus === "approved" && (
                  <Link to="/Tutorhub/bookings">Anfragen ansehen</Link>
                )}
              </div>
            </article>
          </div>

          <div className={s.quickGrid}>
            <Link className={s.primaryCard} to="/Tutorhub/teachers">
              <span>Marketplace</span>
              <strong>Lehrer suchen</strong>
              <p>
                {hasApprovedStudent
                  ? "Finde passende Lehrer und starte eine Buchungsanfrage."
                  : "Nach Freigabe deines Schuelerprofils kannst du hier Lehrer buchen."}
              </p>
            </Link>

            <Link className={s.card} to="/Tutorhub/wallet">
              <span>Wallet</span>
              <strong>Guthaben</strong>
              <p>Pruefe Credits und spaeter deine Zahlungen.</p>
            </Link>

            <Link className={s.card} to="/Tutorhub/bookings">
              <span>Buchungen</span>
              <strong>Meine Buchungen</strong>
              <p>Sieh deine Unterrichtsanfragen und spaeter bezahlte Stunden.</p>
            </Link>

            {hasApprovedTeacher && (
              <Link className={s.card} to="/Tutorhub/teacher-setup">
                <span>Lehrer</span>
                <strong>Mein Lehrerprofil</strong>
                <p>Halte Preis, Faecher und Verfuegbarkeit aktuell.</p>
              </Link>
            )}
          </div>

          {tutorhubUser?.profileStatus === "rejected" && tutorhubUser.rejectionReason && (
            <div className={s.warningBox}>
              <strong>Letzte Admin-Notiz:</strong>
              <span>{tutorhubUser.rejectionReason}</span>
            </div>
          )}
        </>
      )}
    </section>
  );
}