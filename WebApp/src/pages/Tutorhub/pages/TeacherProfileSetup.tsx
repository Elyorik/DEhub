import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { getTeacherProfile, saveTeacherProfile } from "../services/tutorhubTeachers";
import s from "./TeacherProfileSetup.module.scss";

function isValidPhone(value: string) {
  return value.replace(/\D/g, "").length >= 7;
}

export default function TeacherProfileSetup() {
  const user = useSelector((state: RootState) => state.user.currentUser);

  const [phone, setPhone] = useState("");
  const [subjects, setSubjects] = useState("");
  const [languages, setLanguages] = useState("Deutsch");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("20");
  const [groupPrice, setGroupPrice] = useState("");
  const [offersGroup, setOffersGroup] = useState(false);
  const [availability, setAvailability] = useState("");
  const [curriculumImageUrl, setCurriculumImageUrl] = useState("");
  const [currentStatus, setCurrentStatus] = useState<"missing" | "pending" | "approved" | "rejected">("missing");
  const [rejectionReason, setRejectionReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const subjectList = subjects.split(",").map((item) => item.trim()).filter(Boolean);
  const languageList = languages.split(",").map((item) => item.trim()).filter(Boolean);
  const priceNumber = Number(price);
  const groupPriceNumber = Number(groupPrice);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    getTeacherProfile(user.id)
      .then((profile) => {
        if (!profile) {
          setCurrentStatus("missing");
          return;
        }

        setPhone(profile.phone || "");
        setSubjects(profile.subjects.join(", "));
        setLanguages(profile.languages.join(", "));
        setShortDescription(profile.shortDescription || "");
        setDescription(profile.description || "");
        setPrice(String(profile.individualPrice || 20));
        setGroupPrice(profile.groupPrice ? String(profile.groupPrice) : "");
        setOffersGroup(Boolean(profile.offersGroup));
        setAvailability(profile.availability || "");
        setCurriculumImageUrl(profile.curriculumImageUrl || "");
        setCurrentStatus(profile.status || "pending");
        setRejectionReason(profile.rejectionReason || "");
      })
      .catch(() => {
        setError("Dein gespeichertes Lehrerprofil konnte nicht geladen werden.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function handleSave() {
    setMessage("");
    setError("");

    if (!user) {
      setError("Bitte melde dich zuerst an.");
      return;
    }

    if (!user.email) {
      setError("Deine E-Mail fehlt im Konto. Bitte melde dich neu an.");
      return;
    }

    if (!phone.trim() || !isValidPhone(phone)) {
      setError("Bitte gib eine gueltige Telefonnummer ein.");
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
        email: user.email,
        phone: phone.trim(),
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
        rejectionReason: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      setCurrentStatus("pending");
      setRejectionReason("");
      setMessage("Dein Lehrerprofil wurde eingereicht und wartet auf Freigabe.");
    } catch (err) {
      console.error(err);
      setError("Profil konnte nicht gespeichert werden. Bitte versuche es nochmal.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <section className={s.page}>Lehrerprofil wird geladen...</section>;
  }

  return (
    <section className={s.page}>
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub Lehrerbereich</p>
        <h1>Lehrer-Infoblatt</h1>
        <p>
          Erstelle oder bearbeite dein Lehrerprofil. Nach jeder Aenderung wird es
          erneut geprueft, bevor es in der Lehrerliste erscheint.
        </p>
      </div>

      <div className={s.layout}>
        <form className={s.form} onSubmit={(e) => e.preventDefault()}>
          {currentStatus === "pending" && (
            <p className={s.success}>Dein Lehrerprofil wartet aktuell auf Pruefung.</p>
          )}

          {currentStatus === "approved" && (
            <p className={s.success}>Dein Lehrerprofil ist freigegeben. Aenderungen werden erneut geprueft.</p>
          )}

          {currentStatus === "rejected" && (
            <p className={s.error}>
              Dein Lehrerprofil wurde abgelehnt. Grund: {rejectionReason || "Bitte ueberarbeiten."}
            </p>
          )}

          <label>
            E-Mail aus deinem Konto
            <input value={user?.email || ""} disabled />
          </label>

          <label>
            Telefonnummer
            <input
              placeholder="+998 ..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>

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
          {message && (
            <div className={s.success}>
              <p>{message}</p>
              <Link to="/Tutorhub/main">Zum Dashboard</Link>
            </div>
          )}

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