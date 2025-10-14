import { useState } from "react";
import s from "./spiele.module.scss";

// === Мини-игры ===
function GuessArticleGame() {
  const words = [
    { word: "Tisch", article: "der" },
    { word: "Lampe", article: "die" },
    { word: "Auto", article: "das" },
  ];
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState("");

  const current = words[index];

  const check = (a: string) => {
    if (a === current.article) {
      setMessage("✅ Richtig!");
      setTimeout(() => nextWord(), 800);
    } else {
      setMessage("❌ Falsch!");
    }
  };

  const nextWord = () => {
    setIndex((prev) => (prev + 1) % words.length);
    setMessage("");
  };

  return (
    <div className={s.gameContainer}>
      <h2>🎯 Угадай артикль</h2>
      <p className={s.word}>{current.word}</p>
      <div className={s.buttons}>
        <button onClick={() => check("der")}>der</button>
        <button onClick={() => check("die")}>die</button>
        <button onClick={() => check("das")}>das</button>
      </div>
      <p className={s.message}>{message}</p>
    </div>
  );
}

function MemoryGame() {
  return (
    <div className={s.gameContainer}>
      <h2>🧠 Игра “Память”</h2>
      <p>Здесь будет мини-игра на запоминание слов (можно добавить позже).</p>
    </div>
  );
}

// === Главный компонент Spiele ===
export default function Spiele() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: "article",
      title: "Угадай артикль",
      image:
        "https://images.unsplash.com/photo-1553531888-6e554a9a7e96?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: "memory",
      title: "Память для слов",
      image:
        "https://images.unsplash.com/photo-1581093588401-22d8a2bfb42d?auto=format&fit=crop&w=800&q=60",
    },
  ];

  if (selectedGame) {
    let GameComponent;
    switch (selectedGame) {
      case "article":
        GameComponent = <GuessArticleGame />;
        break;
      case "memory":
        GameComponent = <MemoryGame />;
        break;
      default:
        GameComponent = null;
    }

    return (
      <div className={s.spieleWrapper}>
        <button className={s.backButton} onClick={() => setSelectedGame(null)}>
          ⬅️ Назад к играм
        </button>
        <div className={s.gameWrapper}>{GameComponent}</div>
      </div>
    );
  }

  return (
    <div className={s.spieleWrapper}>
      <h1 className={s.title}>🎮 Spiele – Игры для изучения немецкого</h1>
      <div className={s.cardsGrid}>
        {games.map((g) => (
          <div
            key={g.id}
            className={s.card}
            style={{ backgroundImage: `url(${g.image})` }}
            onClick={() => setSelectedGame(g.id)}
          >
            <div className={s.overlay}>
              <h2>{g.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
