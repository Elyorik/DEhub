import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import type { TutorhubBooking } from "../services/tutorhubBookings";
import {
  acceptTutorhubBooking,
  cancelTutorhubBooking,
  completeTutorhubBooking,
  getStudentBookings,
  getTeacherBookings,
  rejectTutorhubBooking,
} from "../services/tutorhubBookings";
import { getTutorhubUser } from "../services/tutorhubUsers";
import s from "./Bookings.module.scss";
import TutorhubBackToDashboard from "../components/TutorhubBackToDashboard";

function statusLabel(status: string) {
  if (status === "pending") return "Pending";
  if (status === "accepted") return "Angenommen";
  if (status === "rejected") return "Abgelehnt";
  if (status === "paid") return "Bezahlt";
  if (status === "completed") return "Abgeschlossen";
  if (status === "cancelled") return "Storniert";
  return status;
}

export default function Bookings() {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const [role, setRole] = useState<"student" | "teacher" | "admin" | null>(null);
  const [bookings, setBookings] = useState<TutorhubBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadBookings() {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const tutorhubUser = await getTutorhubUser(user.id);
      setRole(tutorhubUser?.role || null);

      const nextBookings = tutorhubUser?.role === "teacher"
        ? await getTeacherBookings(user.id)
        : await getStudentBookings(user.id);
      setBookings(nextBookings);
    } catch (err) {
      console.error(err);
      setError("Buchungen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, [user]);

  async function handleAccept(bookingId: string) {
    await acceptTutorhubBooking(bookingId);
    setMessage("Buchung wurde angenommen.");
    await loadBookings();
  }

  async function handleReject(bookingId: string) {
    const reason = window.prompt("Grund für Ablehnung?", "Termin passt leider nicht.") || "";
    await rejectTutorhubBooking(bookingId, reason);
    setMessage("Buchung wurde abgelehnt.");
    await loadBookings();
  }

  async function handleCancel(bookingId: string) {
    await cancelTutorhubBooking(bookingId);
    setMessage("Buchung wurde storniert.");
    await loadBookings();
  }

  async function handleComplete(bookingId: string) {
    await completeTutorhubBooking(bookingId);
    setMessage("Buchung wurde abgeschlossen.");
    await loadBookings();
  }

  return (
    <section className={s.page}>
      <TutorhubBackToDashboard />
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub</p>
        <h1>Meine Buchungen</h1>
        <p>
          Verwalte deine Unterrichtsanfragen und öffne nach einer Zusage direkt den Videounterricht.
        </p>
      </div>

      {message && <p className={s.message}>{message}</p>}
      {error && <p className={s.error}>{error}</p>}

      <div className={s.layout}>
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <div>
              <h2>{role === "teacher" ? "Anfragen an mich" : "Meine Anfragen"}</h2>
              <p>
                {role === "teacher"
                  ? "Schüler, die Unterricht bei dir angefragt haben."
                  : "Lehrer, bei denen du Unterricht angefragt hast."}
              </p>
            </div>
            <Link to="/Tutorhub/teachers">Lehrer suchen</Link>
          </div>

          <div className={s.list}>
            {loading ? (
              <p className={s.empty}>Buchungen werden geladen...</p>
            ) : bookings.length === 0 ? (
              <p className={s.empty}>Keine Buchungen in dieser Ansicht.</p>
            ) : (
              bookings.map((booking) => (
                <article className={s.bookingCard} key={booking.id}>
                  <div className={s.bookingTop}>
                    <div>
                      <h3>{booking.subject}</h3>
                      <p>
                        {role === "teacher"
                          ? `Schüler: ${booking.studentName || "Nicht angegeben"}`
                          : `Lehrer: ${booking.teacherName}`}
                      </p>
                    </div>
                    <b className={s[booking.status]}>{statusLabel(booking.status)}</b>
                  </div>

                  <div className={s.meta}>
                    <span>{booking.lessonType === "individual" ? "Einzelunterricht" : "Gruppenunterricht"}</span>
                    <span>{booking.credits} Credits</span>
                  </div>

                  {booking.message && (
                    <p className={s.noteBox}>Nachricht: {booking.message}</p>
                  )}

                  {booking.rejectionReason && (
                    <p className={s.rejectBox}>Ablehnungsgrund: {booking.rejectionReason}</p>
                  )}

                  {booking.meetingLink && (
                    <a className={s.meetingLink} href={booking.meetingLink} target="_blank" rel="noreferrer">
                      Meeting öffnen
                    </a>
                  )}

                  <div className={s.actions}>
                    {role === "teacher" && booking.status === "pending" && (
                      <>
                        <button type="button" onClick={() => handleAccept(booking.id)}>
                          Annehmen
                        </button>
                        <button type="button" onClick={() => handleReject(booking.id)}>
                          Ablehnen
                        </button>
                      </>
                    )}

                    {role === "teacher" && (booking.status === "accepted" || booking.status === "paid") && (
                      <>
                        <button type="button" onClick={() => handleComplete(booking.id)}>
                          Abschließen
                        </button>
                      </>
                    )}

                    {role === "student" && (booking.status === "pending" || booking.status === "accepted") && (
                      <button type="button" onClick={() => handleCancel(booking.id)}>
                        Stornieren
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <aside className={s.side}>
          <h2>Booking Flow</h2>
          <p>
            Nach einer Zusage wird automatisch ein persönlicher Jitsi-Meeting-Link erstellt.
          </p>
          <Link to="/Tutorhub/teachers">Jetzt Lehrer ansehen</Link>
        </aside>
      </div>
    </section>
  );
}
