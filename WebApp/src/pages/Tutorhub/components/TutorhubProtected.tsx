import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";

type Props = {
  children: ReactNode;
};

export default function TutorhubProtected({ children }: Props) {
  const user = useSelector((state: RootState) => state.user.currentUser);

  if (!user) {
    return (
      <div style={{ padding: "96px 24px", textAlign: "center" }}>
        <h1>Bitte zuerst anmelden</h1>
        <p>Du brauchst ein Konto, um TutorHub zu benutzen.</p>
        <Link to="/account">Zum Login</Link>
      </div>
    );
  }

  return <>{children}</>;
}