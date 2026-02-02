import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import s from "./home.module.scss";
import newSuchmaschiene from "../../assets/UpdatesImg/newSuchmaschiene.png";
import newKIWerkzeuge from "../../assets/UpdatesImg/newKIWerkzeuge.png";
import newSchule60 from "..\..\assets\UpdatesImg\newSchule60.png";
import counterStyle from "../../components/VisitorsCounter/visitorCounter.module.scss";

// ===== Feature Card Configuration =====
// Easy to add, remove, or change cards here
interface FeatureCard {
  title: string;
  description: string;
  image: string;
  link: string;
  bgColor: string;
  isSpecial?: boolean;
}

const featureCards: FeatureCard[] = [
  {
    title: "Neue Funktionen",
    description: "Entdecke unsere neuesten Funktionen, die dir helfen, dein Deutschlernen zu optimieren...",
    image: newKIWerkzeuge,
    link: "/ki",
    bgColor: "#ffebee",
  },
  {
    title: "Verbesserung der Suchmaschine",
    description: "Unsere Suchmaschine wurde verbessert...",
    image: newSuchmaschiene,
    link: "/suchen",
    bgColor: "#e3f2fd",
  },
  {
    title: "Meine Schule 60",
    description: "Entdecke alles über unsere Schule",
    image: newSchule60, // Replace with schule60 image when available
    link: "/schule60",
    bgColor: "#e8f5e9",
    isSpecial: true,
  },
];

// ===== Reusable Feature Card Component =====
function FeatureCard({ card }: { card: FeatureCard }) {
  if (card.isSpecial) {
    return (
      <Link to={card.link} className={s.specialCard}>
        <div className={s.specialCardContent}>
          <h2>{card.title}</h2>
          <p>{card.description}</p>
        </div>
        <div className={s.specialCardImage}>
          <img src={card.image} alt={card.title} />
        </div>
      </Link>
    );
  }

  return (
    <Link to={card.link} className={s.featureCard} style={{ background: card.bgColor }}>
      <h2>{card.title}</h2>
      <p>{card.description}</p>
      <img src={card.image} alt={card.title} />
    </Link>
  );
}

function Home() {
  const [online, setOnline] = useState<number>(0);

  useEffect(() => {
    const updateOnline = () => {
      const data = localStorage.getItem("onlineCount");
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setOnline(parsed.value || 0);
        } catch (e) {
          console.error("Ошибка чтения localStorage:", e);
        }
      }
    };

    // 🔹 при загрузке сразу читаем значение
    updateOnline();

    // 🔹 слушаем событие изменения localStorage (работает даже без перезагрузки)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "onlineCount") updateOnline();
    };
    window.addEventListener("storage", handleStorageChange);

    // 🔹 на всякий случай обновляем каждые 10 сек
    const interval = setInterval(updateOnline, 10000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={s.home}>
      <section className={s.landing}>
        <h1>DEhub</h1>
        <h2>Deutsch lernen = DSD bestehen.</h2>
        <p>
          Ganz einfach! Der Ort, an dem du Antworten findest und sicher zur
          Prüfung gehst.
        </p>
        <Link to="/suchen">
          <button>Suchen</button>
        </Link>
      </section>

      <div className={s.containers}>
        {featureCards.map((card, index) => (
          <FeatureCard key={index} card={card} />
        ))}
      </div>

      {/* 👇 Онлайн счётчик с твоим дизайном */}
      <div className={counterStyle.counterContainer}>
        <h2 className={counterStyle.title}>
          Jetzt online:
          <span className={counterStyle.number}>{online}</span>
        </h2>
      </div>
    </div>
  );
}

export default Home;
