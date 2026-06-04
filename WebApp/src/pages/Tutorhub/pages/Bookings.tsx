import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import type { TutorhubBooking } from "../services/tutorhubBookings";
import { getStudentBookings } from "../services/tutorhubBookings";
import s from "./Bookings.module.scss";

export default function Bookings() {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const [bookings, setBookings] = useState<TutorhubBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    getStudentBookings(user.id)
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <section className={s.page}>
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub</p>
        <h1>Meine Buchungen</h1>
        <p>
          Hier werden deine Buchungsanfragen, bezahlten Unterrichte und
          abgeschlossenen Stunden angezeigt.
        </p>
      </div>

      <div className={s.layout}>
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <h2>Aktuelle Buchungen</h2>
            <Link to="/Tutorhub/teachers">Lehrer suchen</Link>
          </div>

          <div className={s.table}>
            <div className={s.tableHead}>
              <span>Fach</span>
              <span>Lehrer</span>
              <span>Typ</span>
              <span>Status</span>
              <span>Credits</span>
            </div>

            {loading ? (
              <p className={s.empty}>Buchungen werden geladen...</p>
            ) : bookings.length === 0 ? (
              <p className={s.empty}>Du hast noch keine Buchungen.</p>
            ) : (
              bookings.map((booking) => (
                <div className={s.tableRow} key={booking.id}>
                  <span>{booking.subject}</span>
                  <span>{booking.teacherName}</span>
                  <span>{booking.lessonType === "individual" ? "Einzel" : "Gruppe"}</span>
                  <span>
                    <b>{booking.status}</b>
                  </span>
                  <span>{booking.credits}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className={s.side}>
          <h2>Naechster Schritt</h2>
          <p>
            Buchungen werden zuerst als Anfrage gespeichert. Danach verbinden wir
            Zahlung, Terminbestaetigung und Lehreransicht.
          </p>
          <Link to="/Tutorhub/teachers">Jetzt Lehrer ansehen</Link>
        </aside>
      </div>
    </section>
  );
}