import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { TeacherProfile } from "../models/tutorhubTeacher.model";
import type { StudentProfile } from "../models/tutorhubUser.model";
import {
  type AdminProfileStatus,
  deleteStudentApplication,
  deleteTeacherApplication,
  getAllStudents,
  getAllTeachers,
  updateStudentApproval,
  updateTeacherApproval,
} from "../services/tutorhubAdmin";
import s from "./AdminDashboard.module.scss";
import {
  createCalendarEvent,
  parseCalendarCommand,
  removeCalendarEvent,
  subscribeToCalendarEvents,
  type CalendarEvent,
  type CalendarEventType,
} from "../../../services/calendarEvents";

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
  const [activeSection, setActiveSection] = useState<"tutorhub" | "calendar" | "online">("tutorhub");
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminProfileStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "students" | "teachers">("all");
  const [search, setSearch] = useState("");
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarCommand, setCalendarCommand] = useState("");
  const [calendarMessage, setCalendarMessage] = useState("");
  const [calendarError, setCalendarError] = useState("");
  const [calendarType, setCalendarType] = useState<CalendarEventType>("exam");

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

  useEffect(() => subscribeToCalendarEvents(setCalendarEvents), []);

  async function handleCalendarCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCalendarMessage("");
    setCalendarError("");
    const command = calendarCommand.trim();
    const isDelete = /^delete\s+/i.test(command);
    const parsed = parseCalendarCommand(command.replace(/^delete\s+/i, ""));

    if (!parsed) {
      setCalendarError("Format: 22.09.2026 Exam for DSD2 oder Delete 22.09.2026 Exam for DSD2");
      return;
    }

    try {
      if (isDelete) {
        const found = calendarEvents.find((item) => item.date === parsed.date && item.title.toLowerCase() === parsed.title.toLowerCase());
        if (!found) {
          setCalendarError("Kein passender Termin gefunden.");
          return;
        }
        await removeCalendarEvent(found.id);
        setCalendarMessage("Termin wurde gelöscht.");
      } else {
        await createCalendarEvent(parsed.date, parsed.title, calendarType);
        setCalendarMessage("Termin wurde im Kalender veröffentlicht.");
      }
      setCalendarCommand("");
    } catch (err) {
      console.error(err);
      setCalendarError("Termin konnte nicht gespeichert werden. Prüfe firestore.rules.");
    }
  }

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
    setMessage("");
    setError("");
    await updateStudentApproval(uid, "approved");
    setMessage("Schüler wurde freigegeben.");
    await loadProfiles();
  }

  async function rejectStudent(uid: string) {
    setMessage("");
    setError("");
    const reason = window.prompt("Grund für Ablehnung?", "Bitte Profil überarbeiten.") || "";
    await updateStudentApproval(uid, "rejected", reason);
    setMessage("Schüler wurde abgelehnt.");
    await loadProfiles();
  }

  async function resetStudent(uid: string) {
    setMessage("");
    setError("");
    await updateStudentApproval(uid, "pending");
    setMessage("Schüler wurde wieder auf Pending gesetzt.");
    await loadProfiles();
  }

  async function removeStudent(uid: string, name: string) {
    setMessage("");
    setError("");

    const confirmed = window.confirm(
      `Schüler-Ankete von ${name || uid} wirklich löschen? Der Nutzer kann danach neu starten.`
    );

    if (!confirmed) return;

    try {
      await deleteStudentApplication(uid);
      setMessage("Schüler-Ankete wurde gelöscht.");
      await loadProfiles();
    } catch (err) {
      console.error(err);
      setError("Schüler-Ankete konnte nicht gelöscht werden.");
    }
  }

  async function approveTeacher(uid: string) {
    setMessage("");
    setError("");
    await updateTeacherApproval(uid, "approved");
    setMessage("Lehrer wurde freigegeben.");
    await loadProfiles();
  }

  async function rejectTeacher(uid: string) {
    setMessage("");
    setError("");
    const reason = window.prompt("Grund für Ablehnung?", "Bitte Profil überarbeiten.") || "";
    await updateTeacherApproval(uid, "rejected", reason);
    setMessage("Lehrer wurde abgelehnt.");
    await loadProfiles();
  }

  async function resetTeacher(uid: string) {
    setMessage("");
    setError("");
    await updateTeacherApproval(uid, "pending");
    setMessage("Lehrer wurde wieder auf Pending gesetzt.");
    await loadProfiles();
  }

  async function removeTeacher(uid: string, name: string) {
    setMessage("");
    setError("");

    const confirmed = window.confirm(
      `Lehrer-Ankete von ${name || uid} wirklich löschen? Der Nutzer kann danach neu starten.`
    );

    if (!confirmed) return;

    try {
      await deleteTeacherApplication(uid);
      setMessage("Lehrer-Ankete wurde gelöscht.");
      await loadProfiles();
    } catch (err) {
      console.error(err);
      setError("Lehrer-Ankete konnte nicht gelöscht werden. Pruefe firestore.rules und deploye sie neu.");
    }
  }

  return (
    <section className={s.page}>
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub Admin</p>
        <h1>Profile verwalten</h1>
        <p>
          Pruefe Anketen, gib Profile frei, lehne Profile ab, loesche falsche
          Anketen und behalte die TutorHub-Zahlen im Blick.
        </p>
      </div>

      <nav className={s.adminTabs} aria-label="Admin Bereiche">
        <button type="button" className={activeSection === "tutorhub" ? s.activeTab : ""} onClick={() => setActiveSection("tutorhub")}>TutorHub</button>
        <button type="button" className={activeSection === "calendar" ? s.activeTab : ""} onClick={() => setActiveSection("calendar")}>Kalender</button>
        <button type="button" className={activeSection === "online" ? s.activeTab : ""} onClick={() => setActiveSection("online")}>Online Users</button>
      </nav>

      {activeSection === "tutorhub" && <>
      <div className={s.stats}>
        <article>
          <span>Schüler gesamt</span>
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
            <option value="students">Schüler</option>
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
            <h2>Schüler</h2>
            <span>{filteredStudents.length}</span>
          </div>

          {loading ? (
            <p className={s.empty}>Wird geladen...</p>
          ) : filteredStudents.length === 0 ? (
            <p className={s.empty}>Keine passenden Schülerprofile.</p>
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
                    <button className={s.approveButton} type="button" onClick={() => approveStudent(student.uid)}>
                      Approve
                    </button>
                    <button className={s.rejectButton} type="button" onClick={() => rejectStudent(student.uid)}>
                      Reject
                    </button>
                    <button className={s.pendingButton} type="button" onClick={() => resetStudent(student.uid)}>
                      Pending
                    </button>
                    <button className={s.deleteButton} type="button" onClick={() => removeStudent(student.uid, student.name)}>
                      Delete
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
                    <button className={s.approveButton} type="button" onClick={() => approveTeacher(teacher.uid)}>
                      Approve
                    </button>
                    <button className={s.rejectButton} type="button" onClick={() => rejectTeacher(teacher.uid)}>
                      Reject
                    </button>
                    <button className={s.pendingButton} type="button" onClick={() => resetTeacher(teacher.uid)}>
                      Pending
                    </button>
                    <button className={s.deleteButton} type="button" onClick={() => removeTeacher(teacher.uid, teacher.name)}>
                      Delete
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
      </>}

      {activeSection === "calendar" && (
        <section className={s.calendarAdmin}>
          <h2>Kalender verwalten</h2>
          <p>Neue Termine werden sofort auf der Startseite für alle Nutzer angezeigt.</p>
          <form onSubmit={handleCalendarCommand}>
            <label htmlFor="calendar-command">Kalender-Befehl</label>
            <input id="calendar-command" value={calendarCommand} onChange={(event) => setCalendarCommand(event.target.value)} placeholder="22.09.2026 Exam for DSD2" />
            <select aria-label="Terminart" value={calendarType} onChange={(event) => setCalendarType(event.target.value as CalendarEventType)}>
              <option value="exam">Prüfung</option>
              <option value="event">Termin</option>
              <option value="deadline">Deadline</option>
            </select>
            <button type="submit">Ausführen</button>
          </form>
          <p className={s.commandHint}>Zum Löschen: <code>Delete 22.09.2026 Exam for DSD2</code></p>
          {calendarMessage && <p className={s.message}>{calendarMessage}</p>}
          {calendarError && <p className={s.error}>{calendarError}</p>}
          <div className={s.eventAdminList}>
            {calendarEvents.length === 0 ? <p className={s.empty}>Noch keine Termine geplant.</p> : calendarEvents.map((calendarEvent) => (
              <article key={calendarEvent.id}><time>{calendarEvent.date.split("-").reverse().join(".")}</time><span>{calendarEvent.title}</span><b>{calendarEvent.type === "deadline" ? "Deadline" : calendarEvent.type === "event" ? "Termin" : "Prüfung"}</b><button type="button" onClick={() => removeCalendarEvent(calendarEvent.id)}>Löschen</button></article>
            ))}
          </div>
        </section>
      )}

      {activeSection === "online" && (
        <section className={s.placeholder}><h2>Online Users</h2><p>Dieser Bereich ist für später vorbereitet.</p></section>
      )}
    </section>
  );
}
