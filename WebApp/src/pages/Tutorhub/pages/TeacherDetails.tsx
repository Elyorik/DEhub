import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import type { TeacherProfile } from "../models/tutorhubTeacher.model";
import { createTutorhubBooking } from "../services/tutorhubBookings";
import { getTeacherProfile } from "../services/tutorhubTeachers";
import s from "./TeacherDetails.module.scss";

export default function TeacherDetails() {
  const { id } = useParams();
  const user = useSelector((state: RootState) => state.user.currentUser);
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;

    getTeacherProfile(id)
      .then(setTeacher)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBooking() {
    setBookingMessage("");
    setBookingError("");

    if (!user || !teacher) {
      setBookingError("Bitte melde dich zuerst an.");
      return;
    }

    setBooking(true);

    try {
      await createTutorhubBooking({
        studentId: user.id,
        teacherId: teacher.uid,
        teacherName: teacher.name,
        subject: teacher.subjects[0] || "Unterricht",
        lessonType: "individual",
        credits: teacher.individualPrice,
      });

      setBookingMessage("Buchungsanfrage erstellt. Du findest sie unter Meine Buchungen.");
    } catch (err) {
      console.error(err);
      setBookingError("Buchung konnte nicht erstellt werden. Bitte versuche es nochmal.");
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return <section className={s.page}>Lehrer wird geladen...</section>;
  }

  if (!teacher) {
    return (
      <section className={s.page}>
        <div className={s.notFound}>
          <h1>Lehrer nicht gefunden</h1>
          <Link to="/Tutorhub/teachers">Zurueck zur Lehrerliste</Link>
        </div>
      </section>
    );
  }

  return (
    <section className={s.page}>
      <Link className={s.back} to="/Tutorhub/teachers">
        Zurueck zur Lehrerliste
      </Link>

      <div className={s.profile}>
        <div className={s.main}>
          <div className={s.identity}>
            <div className={s.avatar}>
              {teacher.avatar ? (
                <img src={teacher.avatar} alt={teacher.name} />
              ) : (
                <span>{teacher.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div>
              <p className={s.eyebrow}>TutorHub Lehrer</p>
              <h1>{teacher.name}</h1>
              <p>{teacher.shortDescription}</p>
            </div>
          </div>

          <div className={s.tags}>
            {teacher.subjects.map((subject) => (
              <span key={subject}>{subject}</span>
            ))}
          </div>

          <div className={s.block}>
            <h2>Ueber den Unterricht</h2>
            <p>{teacher.description}</p>
          </div>

          <div className={s.block}>
            <h2>Sprachen und Verfuegbarkeit</h2>
            <p>Sprachen: {teacher.languages.join(", ")}</p>
            <p>{teacher.availability || "Verfuegbarkeit nach Absprache."}</p>
          </div>

          {teacher.curriculumImageUrl && (
            <div className={s.block}>
              <h2>Lehrplan</h2>
              <img className={s.curriculum} src={teacher.curriculumImageUrl} alt="Lehrplan" />
            </div>
          )}
        </div>

        <aside className={s.booking}>
          <p className={s.eyebrow}>Preis</p>
          <strong>{teacher.individualPrice} Credits</strong>
          <span>pro Einzelunterricht</span>

          {teacher.offersGroup && teacher.groupPrice && (
            <div className={s.groupPrice}>
              <b>{teacher.groupPrice} Credits</b>
              <span>pro Gruppenunterricht</span>
            </div>
          )}

          <button type="button" onClick={handleBooking} disabled={booking}>
            {booking ? "Buchung..." : "Unterricht buchen"}
          </button>

          {bookingMessage && <p className={s.success}>{bookingMessage}</p>}
          {bookingError && <p className={s.error}>{bookingError}</p>}

          <Link className={s.bookingLink} to="/Tutorhub/bookings">
            Meine Buchungen
          </Link>

          <p className={s.note}>
            Diese Buchung ist zuerst eine Anfrage. Zahlung und Terminbestaetigung
            verbinden wir im naechsten Schritt.
          </p>
        </aside>
      </div>
    </section>
  );
}