import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { getWallet } from "../services/tutorhubWallet";
import s from "./Wallet.module.scss";

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
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub Wallet</p>
        <h1>Guthaben</h1>
        <p>
          Hier siehst du dein TutorHub-Guthaben. Spaeter werden hier Aufladungen,
          Unterrichtszahlungen und Transaktionen angezeigt.
        </p>
      </div>

      <div className={s.layout}>
        <div className={s.balanceCard}>
          <span>Aktuelles Guthaben</span>
          <strong>{loading ? "..." : balance}</strong>
          <p>Credits</p>
        </div>

        <div className={s.panel}>
          <h2>Aktionen</h2>

          <button type="button" disabled>
            Credits aufladen
          </button>

          <button type="button" disabled>
            Transaktionen anzeigen
          </button>

          <p>
            Zahlungsfunktionen sind noch nicht verbunden. Das Guthaben-System ist
            vorbereitet und kann spaeter mit Payment oder Admin-Aufladung erweitert werden.
          </p>
        </div>

        <div className={s.panel}>
          <h2>Was sind Credits?</h2>
          <p>
            Credits sind das interne TutorHub-Guthaben. Schueler bezahlen damit
            Unterricht, Lehrer erhalten daraus spaeter ihre Auszahlung.
          </p>
          <Link to="/Tutorhub/teachers">Lehrer suchen</Link>
        </div>
      </div>
    </section>
  );
}