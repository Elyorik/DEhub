import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { getStudentProfile } from "../services/tutorhubUsers";
import { getTeacherProfile } from "../services/tutorhubTeachers";

type Props = {
  children: ReactNode;
};

export default function TutorhubApprovedProtected({ children }: Props) {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setApproved(false);
      setLoading(false);
      return;
    }

    async function checkApproval() {
      if (!user) return;

      try {
        const [student, teacher] = await Promise.all([
          getStudentProfile(user.id),
          getTeacherProfile(user.id),
        ]);

        setApproved(
          student?.profileStatus === "approved" ||
          teacher?.status === "approved"
        );
      } catch (err) {
        console.error(err);
        setApproved(false);
      } finally {
        setLoading(false);
      }
    }

    checkApproval();
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: "96px 24px", textAlign: "center" }}>
        TutorHub-Zugriff wird geprueft...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "96px 24px", textAlign: "center" }}>
        <h1>Bitte zuerst anmelden</h1>
        <p>Du brauchst ein Konto, um TutorHub zu benutzen.</p>
        <Link to="/account">Zum Login</Link>
      </div>
    );
  }

  if (!approved) {
    return (
      <div style={{ padding: "96px 24px", textAlign: "center" }}>
        <h1>Ankete wird geprueft</h1>
        <p>
          Du kannst diesen Bereich erst nutzen, wenn deine TutorHub-Ankete
          freigegeben wurde.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link to="/Tutorhub/main">Status ansehen</Link>
          <Link to="/Tutorhub/student-setup">Schueler-Ankete</Link>
          <Link to="/Tutorhub/teacher-setup">Lehrer-Ankete</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}