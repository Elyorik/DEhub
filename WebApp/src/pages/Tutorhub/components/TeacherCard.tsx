import { Link } from "react-router-dom";
import type { TeacherProfile } from "../models/tutorhubTeacher.model";
import s from "./TeacherCard.module.scss";

type Props = {
  teacher: TeacherProfile;
};

export default function TeacherCard({ teacher }: Props) {
  const rating = teacher.rating ? teacher.rating.toFixed(1) : "Neu";
  const reviews = teacher.reviewsCount || 0;

  return (
    <article className={s.card}>
      <div className={s.avatar}>
        {teacher.avatar ? (
          <img src={teacher.avatar} alt={teacher.name} />
        ) : (
          <span>{teacher.name.charAt(0).toUpperCase()}</span>
        )}
      </div>

      <div className={s.content}>
        <div className={s.topLine}>
          <h3>{teacher.name}</h3>
          <span className={s.rating}>{rating}</span>
        </div>

        <p className={s.description}>
          {teacher.shortDescription || "TutorHub Lehrerprofil"}
        </p>

        <div className={s.tags}>
          {teacher.subjects.slice(0, 4).map((subject) => (
            <span key={subject}>{subject}</span>
          ))}
        </div>

        <div className={s.metaText}>
          <span>{teacher.languages.join(", ")}</span>
          <span>{reviews} Bewertungen</span>
        </div>
      </div>

      <div className={s.action}>
        <strong>{teacher.individualPrice} Credits</strong>
        <span>Einzelunterricht</span>
        <Link to={`/Tutorhub/teachers/${teacher.uid}`}>Profil ansehen</Link>
      </div>
    </article>
  );
}