import { useEffect, useMemo, useState } from "react";
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
  setTutorhubBookingMeetingLink,
} from "../services/tutorhubBookings";
import { getTutorhubUser } from "../services/tutorhubUsers";
import s from "./Bookings.module.scss";
import TutorhubBackToDashboard from "../components/TutorhubBackToDashboard";

type ViewMode = "student" | "teacher";

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
  const [studentBookings, setStudentBookings] = useState<TutorhubBooking[]>([]);
  const [teacherBookings, setTeacherBookings] = useState<TutorhubBooking[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("student");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadBookings() {
    if (!user) {
      setStudentBookings([]);
      setTeacherBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const tutorhubUser = await getTutorhubUser(user.id);
      setRole(tutorhubUser?.role || null);

      const [studentData, teacherData] = await Promise.all([
        getStudentBookings(user.id),
        getTeacherBookings(user.id),
      ]);

      setStudentBookings(studentData);
      setTeacherBookings(teacherData);

      if (tutorhubUser?.role === "teacher") {
        setViewMode("teacher");
      } else {
        setViewMode("student");
      }
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

  const visibleBookings = useMemo(() => {
    return viewMode === "teacher" ? teacherBookings : studentBookings;
  }, [viewMode, studentBookings, teacherBookings]);

  async function handleAccept(bookingId: string) {
    await acceptTutorhubBooking(bookingId);
    setMessage("Buchung wurde angenommen.");
    await loadBookings();
  }

  async function handleReject(bookingId: string) {
    const reason = window.prompt("Grund fuer Ablehnung?", "Termin passt leider nicht.") || "";
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

  async function handleMeetingLink(booking: TutorhubBooking) {
    const link = window.prompt("Meeting-Link", booking.meetingLink || "https://") || "";
    if (!link.trim()) return;

    await setTutorhubBookingMeetingLink(booking.id, link.trim());
    setMessage("Meeting-Link wurde gespeichert.");
    await loadBookings();
  }

  return (
    <section className={s.page}>
      <TutorhubBackToDashboard />
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub</p>
        <h1>Meine Buchungen</h1>
        <p>
          Verwalte Unterrichtsanfragen, Zusagen, Ablehnungen und spaeter bezahlte Stunden.
        </p>
      </div>

      {message && <p className={s.message}>{message}</p>}
      {error && <p className={s.error}>{error}</p>}

      <div className={s.layout}>
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <div>
              <h2>{viewMode === "teacher" ? "Anfragen an mich" : "Meine Anfragen"}</h2>
              <p>
                {viewMode === "teacher"
                  ? "Schueler, die Unterricht bei dir angefragt haben."
                  : "Lehrer, bei denen du Unterricht angefragt hast."}
              </p>
            </div>
            <Link to="/Tutorhub/teachers">Lehrer suchen</Link>
          </div>

          <div className={s.tabs}>
            <button
              type="button"
              className={viewMode === "student" ? s.active : ""}
              onClick={() => setViewMode("student")}
            >
              Als Schueler ({studentBookings.length})
            </button>
            <button
              type="button"
              className={viewMode === "teacher" ? s.active : ""}
              onClick={() => setViewMode("teacher")}
              disabled={role !== "teacher" && teacherBookings.length === 0}
            >
              Als Lehrer ({teacherBookings.length})
            </button>
          </div>

          <div className={s.list}>
            {loading ? (
              <p className={s.empty}>Buchungen werden geladen...</p>
            ) : visibleBookings.length === 0 ? (
              <p className={s.empty}>Keine Buchungen in dieser Ansicht.</p>
            ) : (
              visibleBookings.map((booking) => (
                <article className={s.bookingCard} key={booking.id}>
                  <div className={s.bookingTop}>
                    <div>
                      <h3>{booking.subject}</h3>
                      <p>
                        {viewMode === "teacher"
                          ? `Schueler: ${booking.studentName}`
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
                      Meeting oeffnen
                    </a>
                  )}

                  <div className={s.actions}>
                    {viewMode === "teacher" && booking.status === "pending" && (
                      <>
                        <button type="button" onClick={() => handleAccept(booking.id)}>
                          Annehmen
                        </button>
                        <button type="button" onClick={() => handleReject(booking.id)}>
                          Ablehnen
                        </button>
                      </>
                    )}

                    {viewMode === "teacher" && (booking.status === "accepted" || booking.status === "paid") && (
                      <>
                        <button type="button" onClick={() => handleMeetingLink(booking)}>
                          Meeting-Link
                        </button>
                        <button type="button" onClick={() => handleComplete(booking.id)}>
                          Abschliessen
                        </button>
                      </>
                    )}

                    {viewMode === "student" && (booking.status === "pending" || booking.status === "accepted") && (
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
            Pending bedeutet Anfrage. Der Lehrer kann annehmen oder ablehnen.
            Zahlung und Credits verbinden wir im naechsten Schritt.
          </p>
          <Link to="/Tutorhub/teachers">Jetzt Lehrer ansehen</Link>
        </aside>
      </div>
    </section>
  );
}