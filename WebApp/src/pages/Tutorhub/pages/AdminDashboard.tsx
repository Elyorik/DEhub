import { useEffect, useMemo, useState } from "react";
import type { TeacherProfile } from "../models/tutorhubTeacher.model";
import type { StudentProfile } from "../models/tutorhubUser.model";
import {
  type AdminProfileStatus,
  getAllStudents,
  getAllTeachers,
  updateStudentApproval,
  updateTeacherApproval,
} from "../services/tutorhubAdmin";
import s from "./AdminDashboard.module.scss";

function getStudentStatus(student: StudentProfile) {
  return student.profileStatus || "pending";
}

function getTeacherStatus(teacher: TeacherProfile) {
  return teacher.status || "pending";
}

function statusLabel(status: string) {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  if (status === "pending") return "Pending";
  return "Missing";
}

function matchesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminProfileStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "students" | "teachers">("all");
  const [search, setSearch] = useState("");

  async function loadProfiles() {
    setLoading(true);
    setError("");

    try {
      const [studentProfiles, teacherProfiles] = await Promise.all([
        getAllStudents(),
        getAllTeachers(),
      ]);

      setStudents(studentProfiles);
      setTeachers(teacherProfiles);
    } catch (err) {
      console.error(err);
      setError("Admin-Daten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfiles();
  }, []);

  const stats = useMemo(() => {
    const pendingStudents = students.filter((student) => getStudentStatus(student) === "pending").length;
    const pendingTeachers = teachers.filter((teacher) => getTeacherStatus(teacher) === "pending").length;
    const approvedStudents = students.filter((student) => getStudentStatus(student) === "approved").length;
    const approvedTeachers = teachers.filter((teacher) => getTeacherStatus(teacher) === "approved").length;

    return {
      studentsTotal: students.length,
      teachersTotal: teachers.length,
      pendingTotal: pendingStudents + pendingTeachers,
      approvedTotal: approvedStudents + approvedTeachers,
    };
  }, [students, teachers]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const status = getStudentStatus(student);
      const statusOk = statusFilter === "all" || status === statusFilter;
      const typeOk = typeFilter === "all" || typeFilter === "students";
      const searchOk =
        !query ||
        matchesQuery(student.name || "", query) ||
        matchesQuery(student.email || "", query) ||
        matchesQuery(student.phone || "", query) ||
        student.subjects.some((subject) => matchesQuery(subject, query));

      return statusOk && typeOk && searchOk;
    });
  }, [students, statusFilter, typeFilter, search]);

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teachers.filter((teacher) => {
      const status = getTeacherStatus(teacher);
      const statusOk = statusFilter === "all" || status === statusFilter;
      const typeOk = typeFilter === "all" || typeFilter === "teachers";
      const searchOk =
        !query ||
        matchesQuery(teacher.name || "", query) ||
        matchesQuery(teacher.email || "", query) ||
        matchesQuery(teacher.phone || "", query) ||
        teacher.subjects.some((subject) => matchesQuery(subject, query));

      return statusOk && typeOk && searchOk;
    });
  }, [teachers, statusFilter, typeFilter, search]);

  async function approveStudent(uid: string) {
    await updateStudentApproval(uid, "approved");
    setMessage("Schueler wurde freigegeben.");
    await loadProfiles();
  }

  async function rejectStudent(uid: string) {
    const reason = window.prompt("Grund fuer Ablehnung?", "Bitte Profil ueberarbeiten.") || "";
    await updateStudentApproval(uid, "rejected", reason);
    setMessage("Schueler wurde abgelehnt.");
    await loadProfiles();
  }

  async function resetStudent(uid: string) {
    await updateStudentApproval(uid, "pending");
    setMessage("Schueler wurde wieder auf Pending gesetzt.");
    await loadProfiles();
  }

  async function approveTeacher(uid: string) {
    await updateTeacherApproval(uid, "approved");
    setMessage("Lehrer wurde freigegeben.");
    await loadProfiles();
  }

  async function rejectTeacher(uid: string) {
    const reason = window.prompt("Grund fuer Ablehnung?", "Bitte Profil ueberarbeiten.") || "";
    await updateTeacherApproval(uid, "rejected", reason);
    setMessage("Lehrer wurde abgelehnt.");
    await loadProfiles();
  }

  async function resetTeacher(uid: string) {
    await updateTeacherApproval(uid, "pending");
    setMessage("Lehrer wurde wieder auf Pending gesetzt.");
    await loadProfiles();
  }

  return (
    <section className={s.page}>
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub Admin</p>
        <h1>Profile verwalten</h1>
        <p>
          Pruefe Anketen, gib Profile frei, lehne Profile ab und behalte die
          TutorHub-Zahlen im Blick.
        </p>
      </div>

      <div className={s.stats}>
        <article>
          <span>Schueler gesamt</span>
          <strong>{stats.studentsTotal}</strong>
        </article>
        <article>
          <span>Lehrer gesamt</span>
          <strong>{stats.teachersTotal}</strong>
        </article>
        <article>
          <span>Pending</span>
          <strong>{stats.pendingTotal}</strong>
        </article>
        <article>
          <span>Approved</span>
          <strong>{stats.approvedTotal}</strong>
        </article>
      </div>

      {message && <p className={s.message}>{message}</p>}
      {error && <p className={s.error}>{error}</p>}

      <div className={s.toolbar}>
        <label>
          Suche
          <input
            placeholder="Name, E-Mail, Telefon oder Fach"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label>
          Typ
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}>
            <option value="all">Alle</option>
            <option value="students">Schueler</option>
            <option value="teachers">Lehrer</option>
          </select>
        </label>

        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as AdminProfileStatus)}>
            <option value="all">Alle</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>

        <button type="button" onClick={loadProfiles}>
          Aktualisieren
        </button>
      </div>

      <div className={s.grid}>
        <div className={s.panel}>
          <div className={s.panelHeader}>
            <h2>Schueler</h2>
            <span>{filteredStudents.length}</span>
          </div>

          {loading ? (
            <p className={s.empty}>Wird geladen...</p>
          ) : filteredStudents.length === 0 ? (
            <p className={s.empty}>Keine passenden Schuelerprofile.</p>
          ) : (
            filteredStudents.map((student) => {
              const status = getStudentStatus(student);

              return (
                <article className={s.item} key={student.uid}>
                  <div className={s.itemTop}>
                    <div>
                      <h3>{student.name}</h3>
                      <p>{student.email}</p>
                      <p>{student.phone}</p>
                    </div>
                    <b className={s[status]}>{statusLabel(status)}</b>
                  </div>

                  <div className={s.tags}>
                    {student.subjects.map((subject) => (
                      <span key={subject}>{subject}</span>
                    ))}
                  </div>

                  <p>{student.learningGoal}</p>
                  <p>Format: {student.preferredFormat}</p>
                  <p>Niveau: {student.classLevel || "Nicht angegeben"}</p>

                  {student.rejectionReason && (
                    <p className={s.reason}>Grund: {student.rejectionReason}</p>
                  )}

                  <div className={s.actions}>
                    <button type="button" onClick={() => approveStudent(student.uid)}>
                      Approve
                    </button>
                    <button type="button" onClick={() => rejectStudent(student.uid)}>
                      Reject
                    </button>
                    <button type="button" onClick={() => resetStudent(student.uid)}>
                      Pending
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className={s.panel}>
          <div className={s.panelHeader}>
            <h2>Lehrer</h2>
            <span>{filteredTeachers.length}</span>
          </div>

          {loading ? (
            <p className={s.empty}>Wird geladen...</p>
          ) : filteredTeachers.length === 0 ? (
            <p className={s.empty}>Keine passenden Lehrerprofile.</p>
          ) : (
            filteredTeachers.map((teacher) => {
              const status = getTeacherStatus(teacher);

              return (
                <article className={s.item} key={teacher.uid}>
                  <div className={s.itemTop}>
                    <div>
                      <h3>{teacher.name}</h3>
                      <p>{teacher.email}</p>
                      <p>{teacher.phone || "Keine Telefonnummer"}</p>
                    </div>
                    <b className={s[status]}>{statusLabel(status)}</b>
                  </div>

                  <div className={s.tags}>
                    {teacher.subjects.map((subject) => (
                      <span key={subject}>{subject}</span>
                    ))}
                  </div>

                  <p>{teacher.shortDescription}</p>
                  <p>Sprachen: {teacher.languages.join(", ")}</p>
                  <strong>{teacher.individualPrice} Credits</strong>

                  {teacher.rejectionReason && (
                    <p className={s.reason}>Grund: {teacher.rejectionReason}</p>
                  )}

                  <div className={s.actions}>
                    <button type="button" onClick={() => approveTeacher(teacher.uid)}>
                      Approve
                    </button>
                    <button type="button" onClick={() => rejectTeacher(teacher.uid)}>
                      Reject
                    </button>
                    <button type="button" onClick={() => resetTeacher(teacher.uid)}>
                      Pending
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}