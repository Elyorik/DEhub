import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { getTeacherProfile } from "../services/tutorhubTeachers";
import { getStudentProfile, getTutorhubUser } from "../services/tutorhubUsers";

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
        const tutorhubUser = await getTutorhubUser(user.id);

        if (tutorhubUser?.role === "student") {
          const student = await getStudentProfile(user.id);
          setApproved(student?.profileStatus === "approved");
          return;
        }

        if (tutorhubUser?.role === "teacher") {
          const teacher = await getTeacherProfile(user.id);
          setApproved(teacher?.status === "approved");
          return;
        }

        setApproved(false);
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
        </div>
      </div>
    );
  }

  return <>{children}</>;
}