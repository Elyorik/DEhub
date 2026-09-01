import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { getTeacherProfile } from "../services/tutorhubTeachers";
import { getStudentProfile, getTutorhubUser, saveStudentProfile } from "../services/tutorhubUsers";
import s from "./StudentProfileSetup.module.scss";
import TutorhubBackToDashboard from "../components/TutorhubBackToDashboard";

function isValidPhone(value: string) {
  return value.replace(/\D/g, "").length >= 7;
}

export default function StudentProfileSetup() {
  const user = useSelector((state: RootState) => state.user.currentUser);

  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [subjects, setSubjects] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [preferredFormat, setPreferredFormat] = useState<"individual" | "group" | "both">("both");
  const [availability, setAvailability] = useState("");
  const [notes, setNotes] = useState("");
  const [currentStatus, setCurrentStatus] = useState<"missing" | "pending" | "approved" | "rejected">("missing");
  const [rejectionReason, setRejectionReason] = useState("");
  const [roleError, setRoleError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const subjectList = subjects.split(",").map((item) => item.trim()).filter(Boolean);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadProfile() {
      if (!user) return;

      try {
        const [tutorhubUser, studentProfile, teacherProfile] = await Promise.all([
          getTutorhubUser(user.id),
          getStudentProfile(user.id),
          getTeacherProfile(user.id),
        ]);

        if (tutorhubUser?.role === "teacher" || teacherProfile) {
          setRoleError("Dieses Konto ist bereits als Lehrer registriert. Du kannst mit diesem Konto keine Schüler-Ankete erstellen.");
          return;
        }

        if (!studentProfile) {
          setCurrentStatus("missing");
          return;
        }

        setPhone(studentProfile.phone || "");
        setAge(studentProfile.age || "");
        setClassLevel(studentProfile.classLevel || "");
        setSubjects(studentProfile.subjects.join(", "));
        setLearningGoal(studentProfile.learningGoal || "");
        setPreferredFormat(studentProfile.preferredFormat || "both");
        setAvailability(studentProfile.availability || "");
        setNotes(studentProfile.notes || "");
        setCurrentStatus(studentProfile.profileStatus || "pending");
        setRejectionReason(studentProfile.rejectionReason || "");
      } catch (err) {
        console.error(err);
        setError("Deine gespeicherte Ankete konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  async function handleSave() {
    setMessage("");
    setError("");

    if (!user) {
      setError("Bitte melde dich zuerst an.");
      return;
    }

    if (roleError) {
      setError(roleError);
      return;
    }

    if (!user.email) {
      setError("Deine E-Mail fehlt im Konto. Bitte melde dich neu an.");
      return;
    }

    if (!phone.trim() || subjectList.length === 0 || !learningGoal.trim()) {
      setError("Bitte fülle Telefonnummer, Fächer und Lernziel aus.");
      return;
    }

    if (!isValidPhone(phone)) {
      setError("Bitte gib eine gültige Telefonnummer ein.");
      return;
    }

    setSaving(true);

    try {
      await saveStudentProfile({
        uid: user.id,
        name: user.name,
        email: user.email,
        phone: phone.trim(),
        age: age.trim(),
        classLevel: classLevel.trim(),
        subjects: subjectList,
        learningGoal: learningGoal.trim(),
        preferredFormat,
        availability: availability.trim(),
        notes: notes.trim(),
        profileStatus: "pending",
        rejectionReason: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      setCurrentStatus("pending");
      setRejectionReason("");
      setMessage("Dein Schülerprofil wurde eingereicht und wartet auf Prüfung.");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Profil konnte nicht gespeichert werden. Bitte versuche es nochmal.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <section className={s.page}>Schülerprofil wird geladen...</section>;
  }

  return (
    <section className={s.page}>
      <TutorhubBackToDashboard />
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub Schülerbereich</p>
        <h1>Schüler-Infoblatt</h1>
        <p>
          Sag uns, wobei du Hilfe brauchst. Du kannst deine Ankete später bearbeiten.
          Nach jeder Änderung wird sie erneut geprüft.
        </p>
      </div>

      <div className={s.layout}>
        <form className={s.form} onSubmit={(e) => e.preventDefault()}>
          {roleError && <p className={s.error}>{roleError}</p>}

          {currentStatus === "pending" && !roleError && (
            <p className={s.success}>Deine Ankete wartet aktuell auf Prüfung.</p>
          )}

          {currentStatus === "approved" && !roleError && (
            <p className={s.success}>Deine Ankete ist freigegeben. Änderungen werden erneut geprüft.</p>
          )}

          {currentStatus === "rejected" && !roleError && (
            <p className={s.error}>
              Deine Ankete wurde abgelehnt. Grund: {rejectionReason || "Bitte überarbeiten."}
            </p>
          )}

          <label>
            E-Mail aus deinem Konto
            <input value={user?.email || ""} disabled />
          </label>

          <div className={s.row}>
            <label>
              Telefonnummer
              <input
                placeholder="+998 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={Boolean(roleError)}
              />
            </label>

            <label>
              Alter
              <input
                placeholder="z.B. 15"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={Boolean(roleError)}
              />
            </label>
          </div>

          <label>
            Klasse / Niveau
            <input
              placeholder="z.B. Klasse 8, A2, B1"
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              disabled={Boolean(roleError)}
            />
          </label>

          <label>
            Fächer
            <input
              placeholder="z.B. Mathe, Deutsch, Englisch"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              disabled={Boolean(roleError)}
            />
          </label>

          <label>
            Lernziel
            <textarea
              placeholder="Was möchtest du verbessern? Prüfung, Hausaufgaben, Grammatik, Sprechen..."
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              rows={6}
              disabled={Boolean(roleError)}
            />
          </label>

          <div className={s.segment}>
            <span>Bevorzugter Unterricht</span>
            <div>
              <button
                type="button"
                className={preferredFormat === "individual" ? s.active : ""}
                onClick={() => setPreferredFormat("individual")}
                disabled={Boolean(roleError)}
              >
                Einzel
              </button>
              <button
                type="button"
                className={preferredFormat === "group" ? s.active : ""}
                onClick={() => setPreferredFormat("group")}
                disabled={Boolean(roleError)}
              >
                Gruppe
              </button>
              <button
                type="button"
                className={preferredFormat === "both" ? s.active : ""}
                onClick={() => setPreferredFormat("both")}
                disabled={Boolean(roleError)}
              >
                Beides
              </button>
            </div>
          </div>

          <label>
            Verfügbarkeit
            <input
              placeholder="z.B. Mo-Fr ab 17:00, Samstag vormittags"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              disabled={Boolean(roleError)}
            />
          </label>

          <label>
            Notizen
            <textarea
              placeholder="Optional: Was soll der Lehrer noch wissen?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              disabled={Boolean(roleError)}
            />
          </label>

          {error && <p className={s.error}>{error}</p>}
          {message && (
            <div className={s.success}>
              <p>{message}</p>
              <Link to="/Tutorhub/main">Zum Dashboard</Link>
            </div>
          )}

          <button className={s.submit} type="button" onClick={handleSave} disabled={saving || Boolean(roleError)}>
            {saving ? "Speichern..." : "Zur Prüfung einreichen"}
          </button>
        </form>

        <aside className={s.preview}>
          <p className={s.previewLabel}>Vorschau</p>
          <h2>{user?.name || "Dein Profil"}</h2>
          <p>{learningGoal || "Dein Lernziel erscheint hier."}</p>

          <div className={s.tags}>
            {subjectList.length > 0 ? (
              subjectList.slice(0, 5).map((subject) => <span key={subject}>{subject}</span>)
            ) : (
              <span>Fach</span>
            )}
          </div>

          <div className={s.infoBox}>
            <span>Format</span>
            <strong>
              {preferredFormat === "individual"
                ? "Einzelunterricht"
                : preferredFormat === "group"
                  ? "Gruppenunterricht"
                  : "Einzel oder Gruppe"}
            </strong>
          </div>

          <div className={s.infoBox}>
            <span>Status</span>
            <strong>{currentStatus}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}