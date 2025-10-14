import { useState } from "react";
import s from "./spiele.module.scss";

// 🔹 Lokale Bilder importieren
import artikelImg from "../../assets/SpieleImg/DerDieDas.png";
import memoryImg from "../../assets/SpieleImg/Memory.png";

type GameType = "artikel" | "memory" | null;

export default function Spiele() {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [score, setScore] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // 🧩 Spiel 1: Artikel-Quiz
  const artikelWords = [
    { word: "Tisch", correct: "der" },
    { word: "Lampe", correct: "die" },
    { word: "Auto", correct: "das" },
    { word: "Hund", correct: "der" },
    { word: "Blume", correct: "die" },
    { word: "Haus", correct: "das" },
    { word: "Computer", correct: "der" },
    { word: "Zeitung", correct: "die" },
    { word: "Buch", correct: "das" },
    { word: "Stuhl", correct: "der" },
    { word: "Katze", correct: "die" },
    { word: "Fenster", correct: "das" },
    { word: "Apfel", correct: "der" },
    { word: "Schule", correct: "die" },
    { word: "Kind", correct: "das" },
  ];

  const currentWord = artikelWords[currentWordIndex];

  const handleArtikelSelect = (artikel: string) => {
    if (artikel === currentWord.correct) {
      setScore(score + 1);
    }
    if (currentWordIndex < artikelWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      alert(`Spiel beendet! Du hast ${score + 1} Punkte.`);
      resetGame();
    }
  };

  // 🎯 Spiel 2: Wort-Memory
  const words = [
    { de: "Hund", en: "dog" },
    { de: "Katze", en: "cat" },
    { de: "Haus", en: "house" },
    { de: "Buch", en: "book" },
    { de: "Auto", en: "car" },
    { de: "Baum", en: "tree" },
  ];

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);

  const cards = [...words, ...words].sort(() => Math.random() - 0.5);

  const handleFlip = (index: number) => {
    if (flipped.length === 2 || flipped.includes(cards[index].de)) return;

    const newFlipped = [...flipped, cards[index].de];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const firstWord = cards.find((c) => c.de === first)!;
      const secondWord = cards.find((c) => c.de === second)!;

      if (firstWord.de === secondWord.de) {
        setMatched([...matched, first]);
      }

      setTimeout(() => setFlipped([]), 1000);
    }
  };

  const resetGame = () => {
    setActiveGame(null);
    setScore(0);
    setCurrentWordIndex(0);
    setFlipped([]);
    setMatched([]);
  };

  return (
    <div className={s.wrapper}>
      {!activeGame && (
        <>
          <h1>Spiele</h1>
          <p>Wähle ein Spiel aus, um dein Deutsch spielerisch zu verbessern:</p>
          <div className={s.gamesGrid}>
            <div className={s.card} onClick={() => setActiveGame("artikel")}>
              <img src={artikelImg} alt="Artikel-Quiz" />
              <div className={s.cardTitle}>Artikel-Quiz</div>
            </div>

            <div className={s.card} onClick={() => setActiveGame("memory")}>
              <img src={memoryImg} alt="Wort-Memory" />
              <div className={s.cardTitle}>Wort-Memory</div>
            </div>
          </div>
        </>
      )}

      {/* 🎮 Artikel-Quiz */}
      {activeGame === "artikel" && (
        <div className={s.gameContainer}>
          <h2>Wähle den richtigen Artikel</h2>
          <h3>{currentWord.word}</h3>
          <div className={s.buttons}>
            {["der", "die", "das"].map((art) => (
              <button key={art} onClick={() => handleArtikelSelect(art)}>
                {art}
              </button>
            ))}
          </div>
          <p>Punkte: {score}</p>
          <button className={s.backButton} onClick={resetGame}>
            Zurück zur Auswahl
          </button>
        </div>
      )}

      {/* 🧠 Wort-Memory */}
      {activeGame === "memory" && (
        <div className={s.memoryGrid}>
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(card.de) || matched.includes(card.de);
            return (
              <div
                key={index}
                className={`${s.memoryCard} ${isFlipped ? s.flipped : ""}`}
                onClick={() => handleFlip(index)}
              >
                {isFlipped ? <span>{card.de}</span> : <span>?</span>}
              </div>
            );
          })}
          <button className={s.backButton} onClick={resetGame}>
            Zurück zur Auswahl
          </button>
        </div>
      )}
    </div>
  );
}
