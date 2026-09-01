import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { getWallet } from "../services/tutorhubWallet";
import s from "./Wallet.module.scss";
import TutorhubBackToDashboard from "../components/TutorhubBackToDashboard";

export default function Wallet() {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBalance(0);
      setLoading(false);
      return;
    }

    getWallet(user.id)
      .then((wallet) => setBalance(wallet.balance))
      .catch(() => setBalance(0))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <section className={s.page}>
      <TutorhubBackToDashboard />
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub Wallet</p>
        <h1>Guthaben</h1>
        <p>
          Hier siehst du dein TutorHub-Guthaben, Zahlungen und deine Einnahmen.
        </p>
      </div>

      <div className={s.layout}>
        <div className={s.balanceCard}>
          <span>Aktuelles Guthaben</span>
          <strong>{loading ? "..." : balance}</strong>
          <p>Credits</p>
          <small>1 Credit = 1 soʻm</small>
        </div>

        <div className={s.panel}>
          <h2>Zahlungsaufteilung</h2>
          <div className={s.split}>
            <div><strong>85%</strong><span>für den Lehrer</span></div>
            <div><strong>15%</strong><span>für die Plattform</span></div>
          </div>
          <p>Bei jeder bezahlten Unterrichtsstunde erhält der Lehrer 85%. 15% bleiben bei TutorHub für Betriebskosten, Support, Sicherheit und die Administration der Plattform.</p>
        </div>

        <div className={s.panel}>
          <h2>Credits & Auszahlungen</h2>

          <button type="button" disabled>
            Credits aufladen
          </button>

          <button type="button" disabled>
            Transaktionen anzeigen
          </button>

          <p>
            Aufladungen und Auszahlungen werden nach der Verbindung eines verifizierten Zahlungsanbieters aktiviert. Bis dahin werden keine echten Geldbeträge über TutorHub verarbeitet.
          </p>
        </div>

        <div className={s.panel}>
          <h2>Wichtige Zahlungsinformationen</h2>
          <p>
            Credits sind das interne TutorHub-Guthaben. Zahlungen können nur nach erfolgreicher Bestätigung durch den Zahlungsanbieter gebucht werden. Prüfe vor jeder Zahlung den Lehrer, den Preis und den Unterrichtstermin. Bei Streitfällen oder Rückerstattungen wende dich an den TutorHub-Support.
          </p>
          <Link to="/Tutorhub/teachers">Lehrer suchen</Link>
        </div>
      </div>
    </section>
  );
}
