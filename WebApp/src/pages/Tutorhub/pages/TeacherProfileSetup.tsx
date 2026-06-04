import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { saveTeacherProfile } from "../services/tutorhubTeachers";
import s from "./TeacherProfileSetup.module.scss";

export default function TeacherProfileSetup() {
  const user = useSelector((state: RootState) => state.user.currentUser);

  const [subjects, setSubjects] = useState("");
  const [languages, setLanguages] = useState("Deutsch");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("20");
  const [groupPrice, setGroupPrice] = useState("");
  const [offersGroup, setOffersGroup] = useState(false);
  const [availability, setAvailability] = useState("");
  const [curriculumImageUrl, setCurriculumImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const subjectList = subjects.split(",").map((item) => item.trim()).filter(Boolean);
  const languageList = languages.split(",").map((item) => item.trim()).filter(Boolean);
  const priceNumber = Number(price);
  const groupPriceNumber = Number(groupPrice);

  async function handleSave() {
    setMessage("");
    setError("");

    if (!user) {
      setError("Bitte melde dich zuerst an.");
      return;
    }

    if (subjectList.length === 0 || !shortDescription.trim() || !description.trim()) {
      setError("Bitte fuelle Faecher, kurze Beschreibung und lange Beschreibung aus.");
      return;
    }

    if (!priceNumber || priceNumber < 1) {
      setError("Bitte gib einen gueltigen Preis fuer Einzelunterricht ein.");
      return;
    }

    if (offersGroup && (!groupPriceNumber || groupPriceNumber < 1)) {
      setError("Bitte gib einen gueltigen Preis fuer Gruppenunterricht ein.");
      return;
    }

    setSaving(true);

    try {
      await saveTeacherProfile({
        uid: user.id,
        name: user.name,
        email: user.email || "",
        avatar: user.avatar,
        subjects: subjectList,
        languages: languageList.length > 0 ? languageList : ["Deutsch"],
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        individualPrice: priceNumber,
        groupPrice: offersGroup ? groupPriceNumber : undefined,
        offersIndividual: true,
        offersGroup,
        curriculumImageUrl: curriculumImageUrl.trim(),
        availability: availability.trim(),
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      setMessage("Dein Lehrerprofil wurde gespeichert und wartet auf Freigabe.");
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
        <p className={s.eyebrow}>TutorHub Lehrerbereich</p>
        <h1>Lehrer-Infoblatt</h1>
        <p>
          Erstelle dein Lehrerprofil. Nach der Pruefung kann dein Profil in der Lehrerliste
          angezeigt werden.
        </p>
      </div>

      <div className={s.layout}>
        <form className={s.form} onSubmit={(e) => e.preventDefault()}>
          <div className={s.row}>
            <label>
              Faecher
              <input
                placeholder="z.B. Mathe, Deutsch, Englisch"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
              />
            </label>

            <label>
              Sprachen
              <input
                placeholder="z.B. Deutsch, Englisch, Russisch"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
              />
            </label>
          </div>

          <label>
            Kurze Beschreibung
            <input
              placeholder="z.B. Mathe-Nachhilfe fuer Klasse 5 bis 9"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </label>

          <label>
            Lange Beschreibung
            <textarea
              placeholder="Erzaehle, wie du unterrichtest, wem du hilfst und was Schueler erwarten koennen."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={7}
            />
          </label>

          <div className={s.row}>
            <label>
              Einzelunterricht Preis
              <input
                type="number"
                min="1"
                placeholder="20"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>

            <label>
              Gruppenunterricht Preis
              <input
                type="number"
                min="1"
                placeholder="Optional"
                value={groupPrice}
                onChange={(e) => setGroupPrice(e.target.value)}
                disabled={!offersGroup}
              />
            </label>
          </div>

          <label className={s.checkbox}>
            <input
              type="checkbox"
              checked={offersGroup}
              onChange={(e) => setOffersGroup(e.target.checked)}
            />
            Ich biete auch Gruppenunterricht an
          </label>

          <label>
            Verfuegbarkeit
            <input
              placeholder="z.B. Mo-Fr ab 16:00, Wochenende nach Absprache"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            />
          </label>

          <label>
            Lehrplan-Bild URL
            <input
              placeholder="https://..."
              value={curriculumImageUrl}
              onChange={(e) => setCurriculumImageUrl(e.target.value)}
            />
          </label>

          {error && <p className={s.error}>{error}</p>}
          {message && <p className={s.success}>{message}</p>}

          <button className={s.submit} type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Speichern..." : "Zur Pruefung einreichen"}
          </button>
        </form>

        <aside className={s.preview}>
          <p className={s.previewLabel}>Vorschau</p>
          <div className={s.avatar}>
            {user?.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{user?.name?.charAt(0) || "T"}</span>}
          </div>
          <h2>{user?.name || "Dein Name"}</h2>
          <p>{shortDescription || "Kurze Beschreibung deines Unterrichts"}</p>

          <div className={s.tags}>
            {subjectList.length > 0 ? (
              subjectList.slice(0, 5).map((subject) => <span key={subject}>{subject}</span>)
            ) : (
              <span>Fach</span>
            )}
          </div>

          <div className={s.priceBox}>
            <strong>{priceNumber || 0} Credits</strong>
            <span>pro Einzelunterricht</span>
          </div>
        </aside>
      </div>
    </section>
  );
}