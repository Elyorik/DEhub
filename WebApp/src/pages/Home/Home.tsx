import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import s from "./home.module.scss";
import newSuchmaschiene from "../../assets/UpdatesImg/newSuchmaschiene.png";
import newKIWerkzeuge from "../../assets/UpdatesImg/newKIWerkzeuge.png";
import counterStyle from "../../components/VisitorsCounter/visitorCounter.module.scss"; // 🔹 твои стили

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
        <section className={s.newFeatures}>
          <h2>Neue Funktionen</h2>
          <p>
            Entdecke unsere neuesten Funktionen, die dir helfen, dein
            Deutschlernen zu optimieren...
          </p>
          <img src={newKIWerkzeuge} alt="Neue Funktionen" />
        </section>

        <section className={s.searchImprovement}>
          <h2>Verbesserung der Suchmaschine</h2>
          <p>Unsere Suchmaschine wurde verbessert...</p>
          <img src={newSuchmaschiene} alt="Suchverbesserung" />
        </section>
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
