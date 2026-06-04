import { useEffect, useState } from "react";
import type { TeacherProfile } from "../models/tutorhubTeacher.model";
import type { StudentProfile } from "../models/tutorhubUser.model";
import {
  getPendingStudents,
  getPendingTeachers,
  updateStudentApproval,
  updateTeacherApproval,
} from "../services/tutorhubAdmin";
import s from "./AdminDashboard.module.scss";

export default function AdminDashboard() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadPendingProfiles() {
    setLoading(true);
    const [studentProfiles, teacherProfiles] = await Promise.all([
      getPendingStudents(),
      getPendingTeachers(),
    ]);
    setStudents(studentProfiles);
    setTeachers(teacherProfiles);
    setLoading(false);
  }

  useEffect(() => {
    loadPendingProfiles().catch(console.error);
  }, []);

  async function approveStudent(uid: string) {
    await updateStudentApproval(uid, "approved");
    setMessage("Schueler wurde freigegeben.");
    await loadPendingProfiles();
  }

  async function rejectStudent(uid: string) {
    const reason = window.prompt("Grund fuer Ablehnung?", "Bitte Profil ueberarbeiten.") || "";
    await updateStudentApproval(uid, "rejected", reason);
    setMessage("Schueler wurde abgelehnt.");
    await loadPendingProfiles();
  }

  async function approveTeacher(uid: string) {
    await updateTeacherApproval(uid, "approved");
    setMessage("Lehrer wurde freigegeben.");
    await loadPendingProfiles();
  }

  async function rejectTeacher(uid: string) {
    const reason = window.prompt("Grund fuer Ablehnung?", "Bitte Profil ueberarbeiten.") || "";
    await updateTeacherApproval(uid, "rejected", reason);
    setMessage("Lehrer wurde abgelehnt.");
    await loadPendingProfiles();
  }

  return (
    <section className={s.page}>
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub Admin</p>
        <h1>Profile pruefen</h1>
        <p>Gib Schueler und Lehrer frei oder lehne unvollstaendige Profile ab.</p>
      </div>

      {message && <p className={s.message}>{message}</p>}

      <div className={s.grid}>
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <h2>Pending Schueler</h2>
            <span>{students.length}</span>
          </div>

          {loading ? (
            <p className={s.empty}>Wird geladen...</p>
          ) : students.length === 0 ? (
            <p className={s.empty}>Keine offenen Schuelerprofile.</p>
          ) : (
            students.map((student) => (
              <article className={s.item} key={student.uid}>
                <h3>{student.name}</h3>
                <p>{student.email}</p>
                <p>{student.phone}</p>
                <div className={s.tags}>
                  {student.subjects.map((subject) => (
                    <span key={subject}>{subject}</span>
                  ))}
                </div>
                <p>{student.learningGoal}</p>
                <div className={s.actions}>
                  <button type="button" onClick={() => approveStudent(student.uid)}>
                    Approve
                  </button>
                  <button type="button" onClick={() => rejectStudent(student.uid)}>
                    Reject
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <div className={s.panel}>
          <div className={s.panelHeader}>
            <h2>Pending Lehrer</h2>
            <span>{teachers.length}</span>
          </div>

          {loading ? (
            <p className={s.empty}>Wird geladen...</p>
          ) : teachers.length === 0 ? (
            <p className={s.empty}>Keine offenen Lehrerprofile.</p>
          ) : (
            teachers.map((teacher) => (
              <article className={s.item} key={teacher.uid}>
                <h3>{teacher.name}</h3>
                <p>{teacher.email}</p>
                <p>{teacher.phone || "Keine Telefonnummer"}</p>
                <div className={s.tags}>
                  {teacher.subjects.map((subject) => (
                    <span key={subject}>{subject}</span>
                  ))}
                </div>
                <p>{teacher.shortDescription}</p>
                <strong>{teacher.individualPrice} Credits</strong>
                <div className={s.actions}>
                  <button type="button" onClick={() => approveTeacher(teacher.uid)}>
                    Approve
                  </button>
                  <button type="button" onClick={() => rejectTeacher(teacher.uid)}>
                    Reject
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}