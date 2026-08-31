import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import type { TeacherProfile } from "../models/tutorhubTeacher.model";
import type { StudentProfile, TutorhubUserProfile } from "../models/tutorhubUser.model";
import { getTeacherProfile } from "../services/tutorhubTeachers";
import { getStudentProfile, getTutorhubUser } from "../services/tutorhubUsers";
import s from "./TutorhubMain.module.scss";

type Role = "student" | "teacher" | "admin" | null;
type Status = "missing" | "pending" | "approved" | "rejected";

function getStatusLabel(status: Status) {
  if (status === "approved") return "Freigegeben";
  if (status === "pending") return "In Pruefung";
  if (status === "rejected") return "Abgelehnt";
  return "Nicht erstellt";
}

export default function TutorhubMain() {
  const user = useSelector((state: RootState) => state.user.currentUser);

  const [role, setRole] = useState<Role>(null);
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

    async function loadDashboard() {
      if (!user) return;

      setLoading(true);
      setError("");

      try {
        const appUser = await getTutorhubUser(user.id);
        setTutorhubUser(appUser);

        if (appUser?.role === "student") {
          const student = await getStudentProfile(user.id);
          setStudentProfile(student);
          setTeacherProfile(null);
          setRole("student");
          return;
        }

        if (appUser?.role === "teacher") {
          const teacher = await getTeacherProfile(user.id);
          setTeacherProfile(teacher);
          setStudentProfile(null);
          setRole("teacher");
          return;
        }

        setRole(null);
        setStudentProfile(null);
        setTeacherProfile(null);
      } catch (err) {
        console.error(err);
        setError("TutorHub-Daten konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  const studentStatus: Status = studentProfile?.profileStatus || "missing";
  const teacherStatus: Status = teacherProfile?.status || "missing";

  return (
    <section className={s.page}>
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub Dashboard</p>
        <h1>Willkommen{user?.name ? `, ${user.name}` : ""}</h1>
        <p>
          Hier siehst du deinen TutorHub-Status und deine naechsten Schritte.
        </p>
      </div>

      {loading ? (
        <div className={s.stateBox}>TutorHub-Daten werden geladen...</div>
      ) : error ? (
        <div className={s.errorBox}>{error}</div>
      ) : !role ? (
        <>
          <div className={s.statusGrid}>
            <article className={s.statusCard}>
              <div className={s.statusTop}>
                <span>Rolle waehlen</span>
                <b className={s.missing}>Noch keine Rolle</b>
              </div>
              <h2>Wie moechtest du TutorHub nutzen?</h2>
              <p>
                Ein Konto kann entweder Schueler oder Lehrer sein. Waehle den passenden Weg.
              </p>
              <div className={s.actions}>
                <Link to="/Tutorhub/student-setup">Als Schueler starten</Link>
                <Link to="/Tutorhub/teacher-setup">Als Lehrer starten</Link>
              </div>
            </article>
          </div>
        </>
      ) : role === "student" ? (
        <>
          <div className={s.statusGrid}>
            <article className={s.statusCard}>
              <div className={s.statusTop}>
                <span>Schuelerprofil</span>
                <b className={s[studentStatus]}>{getStatusLabel(studentStatus)}</b>
              </div>

              <h2>{studentProfile?.name || "Schuelerprofil"}</h2>

              {studentStatus === "approved" && (
                <p>Dein Schuelerprofil ist freigegeben. Du kannst Lehrer suchen und Unterricht anfragen.</p>
              )}

              {studentStatus === "pending" && (
                <p>Deine Ankete wurde eingereicht und wartet auf Admin-Pruefung.</p>
              )}

              {studentStatus === "rejected" && (
                <p>Deine Ankete wurde abgelehnt. Bitte ueberarbeite sie und reiche sie erneut ein.</p>
              )}

              {studentStatus === "missing" && (
                <p>Bitte fuelle zuerst deine Schueler-Ankete aus.</p>
              )}

              {studentProfile?.rejectionReason && (
                <div className={s.reason}>
                  <strong>Grund:</strong>
                  <span>{studentProfile.rejectionReason}</span>
                </div>
              )}

              <div className={s.actions}>
                <Link to="/Tutorhub/student-setup">
                  {studentStatus === "missing" ? "Ankete ausfuellen" : "Ankete bearbeiten"}
                </Link>
                {studentStatus === "approved" && <Link to="/Tutorhub/teachers">Lehrer suchen</Link>}
              </div>
            </article>
          </div>

          <div className={s.quickGrid}>
            <Link className={s.primaryCard} to="/Tutorhub/teachers">
              <span>Marketplace</span>
              <strong>Lehrer suchen</strong>
              <p>Finde passende Lehrer und starte eine Unterrichtsanfrage.</p>
            </Link>

            <Link className={s.card} to="/Tutorhub/bookings">
              <span>Buchungen</span>
              <strong>Meine Anfragen</strong>
              <p>Sieh den Status deiner Unterrichtsanfragen.</p>
            </Link>

            <Link className={s.card} to="/Tutorhub/wallet">
              <span>Wallet</span>
              <strong>Guthaben</strong>
              <p>Pruefe Credits und spaeter Zahlungen.</p>
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className={s.statusGrid}>
            <article className={s.statusCard}>
              <div className={s.statusTop}>
                <span>Lehrerprofil</span>
                <b className={s[teacherStatus]}>{getStatusLabel(teacherStatus)}</b>
              </div>

              <h2>{teacherProfile?.name || "Lehrerprofil"}</h2>

              {teacherStatus === "approved" && (
                <p>Dein Lehrerprofil ist freigegeben. Schueler koennen dich finden und Unterricht anfragen.</p>
              )}

              {teacherStatus === "pending" && (
                <p>Dein Lehrerprofil wurde eingereicht und wartet auf Admin-Pruefung.</p>
              )}

              {teacherStatus === "rejected" && (
                <p>Dein Lehrerprofil wurde abgelehnt. Bitte ueberarbeite es und reiche es erneut ein.</p>
              )}

              {teacherStatus === "missing" && (
                <p>Bitte fuelle zuerst dein Lehrerprofil aus.</p>
              )}

              {teacherProfile?.rejectionReason && (
                <div className={s.reason}>
                  <strong>Grund:</strong>
                  <span>{teacherProfile.rejectionReason}</span>
                </div>
              )}

              <div className={s.actions}>
                <Link to="/Tutorhub/teacher-setup">
                  {teacherStatus === "missing" ? "Profil erstellen" : "Profil bearbeiten"}
                </Link>
                {teacherStatus === "approved" && <Link to="/Tutorhub/bookings">Anfragen ansehen</Link>}
              </div>
            </article>
          </div>

          <div className={s.quickGrid}>
            <Link className={s.primaryCard} to="/Tutorhub/bookings">
              <span>Buchungen</span>
              <strong>Anfragen an mich</strong>
              <p>Sieh Unterrichtsanfragen von Schuelern und antworte darauf.</p>
            </Link>

            <Link className={s.card} to="/Tutorhub/teacher-setup">
              <span>Profil</span>
              <strong>Mein Lehrerprofil</strong>
              <p>Halte Faecher, Preise und Verfuegbarkeit aktuell.</p>
            </Link>

            <Link className={s.card} to="/Tutorhub/wallet">
              <span>Wallet</span>
              <strong>Guthaben</strong>
              <p>Pruefe Credits und spaeter Auszahlungen.</p>
            </Link>
          </div>
        </>
      )}

      {tutorhubUser?.profileStatus === "rejected" && tutorhubUser.rejectionReason && (
        <div className={s.warningBox}>
          <strong>Letzte Admin-Notiz:</strong>
          <span>{tutorhubUser.rejectionReason}</span>
        </div>
      )}
    </section>
  );
}