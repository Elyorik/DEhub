import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { isTutorhubAdmin } from "../services/tutorhubAdmin";

type Props = {
  children: ReactNode;
};

export default function TutorhubAdminProtected({ children }: Props) {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    isTutorhubAdmin(user.id)
      .then(setAllowed)
      .catch(() => setAllowed(false))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <div style={{ padding: "96px 24px", textAlign: "center" }}>Admin-Zugriff wird geprueft...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: "96px 24px", textAlign: "center" }}>
        <h1>Bitte zuerst anmelden</h1>
        <p>Du musst angemeldet sein, um den Admin-Bereich zu oeffnen.</p>
        <Link to="/account">Zum Login</Link>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div style={{ padding: "96px 24px", textAlign: "center" }}>
        <h1>Kein Zugriff</h1>
        <p>Dein Konto ist nicht als TutorHub Admin eingetragen.</p>
        <Link to="/Tutorhub">Zurueck zu TutorHub</Link>
      </div>
    );
  }

  return <>{children}</>;
}