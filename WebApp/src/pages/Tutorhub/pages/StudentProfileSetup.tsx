import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { saveStudentProfile } from "../services/tutorhubUsers";
import s from "./StudentProfileSetup.module.scss";

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
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const subjectList = subjects.split(",").map((item) => item.trim()).filter(Boolean);

  async function handleSave() {
    setMessage("");
    setError("");

    if (!user) {
      setError("Bitte melde dich zuerst an.");
      return;
    }

    if (!phone.trim() || subjectList.length === 0 || !learningGoal.trim()) {
      setError("Bitte fuelle Telefonnummer, Faecher und Lernziel aus.");
      return;
    }

    setSaving(true);

    try {
      await saveStudentProfile({
        uid: user.id,
        name: user.name,
        email: user.email || "",
        phone: phone.trim(),
        age: age.trim(),
        classLevel: classLevel.trim(),
        subjects: subjectList,
        learningGoal: learningGoal.trim(),
        preferredFormat,
        availability: availability.trim(),
        notes: notes.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        profileStatus: "pending",
      });

      setMessage("Dein Schuelerprofil wurde gespeichert.");
    } catch (err) {
      console.error(err);
      setError("Profil konnte nicht gespeichert werden. Bitte versuche es nochmal.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={s.page}>
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub Schuelerbereich</p>
        <h1>Schueler-Infoblatt</h1>
        <p>
          Sag uns, wobei du Hilfe brauchst. Danach kannst du passende Lehrer suchen
          und Unterricht buchen.
        </p>
      </div>

      <div className={s.layout}>
        <form className={s.form} onSubmit={(e) => e.preventDefault()}>
          <div className={s.row}>
            <label>
              Telefonnummer
              <input
                placeholder="+998 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>

            <label>
              Alter
              <input
                placeholder="z.B. 15"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </label>
          </div>

          <label>
            Klasse / Niveau
            <input
              placeholder="z.B. Klasse 8, A2, B1"
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
            />
          </label>

          <label>
            Faecher
            <input
              placeholder="z.B. Mathe, Deutsch, Englisch"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
            />
          </label>

          <label>
            Lernziel
            <textarea
              placeholder="Was moechtest du verbessern? Pruefung, Hausaufgaben, Grammatik, Sprechen..."
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              rows={6}
            />
          </label>

          <div className={s.segment}>
            <span>Bevorzugter Unterricht</span>
            <div>
              <button
                type="button"
                className={preferredFormat === "individual" ? s.active : ""}
                onClick={() => setPreferredFormat("individual")}
              >
                Einzel
              </button>
              <button
                type="button"
                className={preferredFormat === "group" ? s.active : ""}
                onClick={() => setPreferredFormat("group")}
              >
                Gruppe
              </button>
              <button
                type="button"
                className={preferredFormat === "both" ? s.active : ""}
                onClick={() => setPreferredFormat("both")}
              >
                Beides
              </button>
            </div>
          </div>

          <label>
            Verfuegbarkeit
            <input
              placeholder="z.B. Mo-Fr ab 17:00, Samstag vormittags"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            />
          </label>

          <label>
            Notizen
            <textarea
              placeholder="Optional: Was soll der Lehrer noch wissen?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </label>

          {error && <p className={s.error}>{error}</p>}
          {message && (
            <div className={s.success}>
              <p>{message}</p>
              <Link to="/Tutorhub/teachers">Lehrer suchen</Link>
            </div>
          )}

          <button className={s.submit} type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Speichern..." : "Profil speichern"}
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
            <span>Niveau</span>
            <strong>{classLevel || "Noch offen"}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}