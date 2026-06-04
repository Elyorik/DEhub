import { useEffect, useMemo, useState } from "react";
import TeacherCard from "../components/TeacherCard";
import type { TeacherProfile } from "../models/tutorhubTeacher.model";
import { getApprovedTeachers } from "../services/tutorhubTeachers";
import s from "./TeachersList.module.scss";

export default function TeachersList() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");

  useEffect(() => {
    getApprovedTeachers()
      .then(setTeachers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(() => {
    const allSubjects = teachers.flatMap((teacher) => teacher.subjects);
    return Array.from(new Set(allSubjects)).sort();
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teachers.filter((teacher) => {
      const matchesSubject = subject === "all" || teacher.subjects.includes(subject);
      const matchesSearch =
        !query ||
        teacher.name.toLowerCase().includes(query) ||
        teacher.subjects.some((item) => item.toLowerCase().includes(query)) ||
        teacher.shortDescription.toLowerCase().includes(query);

      return matchesSubject && matchesSearch;
    });
  }, [teachers, search, subject]);

  return (
    <section className={s.page}>
      <div className={s.header}>
        <p className={s.eyebrow}>TutorHub</p>
        <h1>Lehrer suchen</h1>
        <p>Finde passende Lehrer nach Fach, Preis und Unterrichtsprofil.</p>
      </div>

      <div className={s.filters}>
        <label>
          Suche
          <input
            placeholder="Name, Fach oder Beschreibung"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <label>
          Fach
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="all">Alle Faecher</option>
            {subjects.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={s.list}>
        {loading ? (
          <p className={s.empty}>Lehrer werden geladen...</p>
        ) : filteredTeachers.length === 0 ? (
          <p className={s.empty}>Noch keine passenden freigegebenen Lehrer gefunden.</p>
        ) : (
          filteredTeachers.map((teacher) => (
            <TeacherCard key={teacher.uid} teacher={teacher} />
          ))
        )}
      </div>
    </section>
  );
}