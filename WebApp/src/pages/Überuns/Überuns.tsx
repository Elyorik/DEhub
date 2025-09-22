import { useEffect, useRef } from "react";
import s from "./überuns.module.scss";

import boyImg from "../../assets/StoryImg/boy.png";
import thinkingImg from "../../assets/StoryImg/thinking.png";
import ideaImg from "../../assets/StoryImg/idea.png";
import codingImg from "../../assets/StoryImg/coding.png";
import logoImg from "../../assets/Logo_Light.png";

const sections = [
  {
    id: 0,
    img: boyImg,
    title: "Ein Schultag",
    text: "Es war ein Tag, an dem alle Kinder im Klassenzimmer saßen. Sie hatten Probleme im Deutschunterricht – niemand konnte die Datei mit den Redemitteln finden.",
  },
  {
    id: 1,
    img: thinkingImg,
    title: "Beobachtung",
    text: "Ein Junge namens Elyor sah das alles. Er merkte, wie viel Zeit verloren ging, und dachte: So darf es nicht bleiben!",
  },
  {
    id: 2,
    img: ideaImg,
    title: "Die Idee",
    text: "Elyor bekam eine Idee: Er wollte etwas erfinden, wo alles gespeichert wird und jeder Zugriff hat.",
  },
  {
    id: 3,
    img: codingImg,
    title: "Die Umsetzung",
    text: "Zum Glück ist Elyor Programmierer. Er setzte sich sofort an den Computer und begann zu arbeiten.",
  },
  {
    id: 4,
    img: logoImg,
    title: "Das Ergebnis",
    text: "So entstand DEhub – eine Webseite und ein Telegram-Bot, die Schülern helfen, alles an einem Ort zu finden.",
  },
];

function ÜberUns() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(s.visible);
          } else {
            entry.target.classList.remove(s.visible); // 👈 wieder ausblenden
          }
        });
      },
      { threshold: 0.2 }
    );

    sectionRefs.current.forEach((sec) => {
      if (sec) observer.observe(sec);
    });

    return () => {
      sectionRefs.current.forEach((sec) => {
        if (sec) observer.unobserve(sec);
      });
    };
  }, []);

  return (
    <div className={s.storyPage}>
      {sections.map((sec, index) => (
        <section
          key={sec.id}
          ref={(el) => (sectionRefs.current[index] = el)}
          className={`${s.section} ${index % 2 === 0 ? s.normal : s.reverse}`}
        >
          <div className={s.text}>
            <h1>{sec.title}</h1>
            <p>{sec.text}</p>
          </div>
          <div className={s.image}>
            <img src={sec.img} alt={sec.title} />
          </div>
        </section>
      ))}
    </div>
  );
}

export default ÜberUns;
