import { useEffect, useMemo, useState } from "react";
import s from "./spiele.module.scss";

import artikelImg from "../../assets/SpieleImg/DerDieDas.png";
import memoryImg from "../../assets/SpieleImg/Memory.png";

type GameType = "artikel" | "memory" | null;

export default function Spiele() {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [score, setScore] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // ======= Artikel-Quiz =======
  const artikelWords = useMemo(
    () => [
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
      { word: "Affe", correct: "der" }, // добавил Affe для emoji
    ],
    []
  );

  const currentWord = artikelWords[currentWordIndex];

  const handleArtikelSelect = (artikel: string) => {
    if (artikel === currentWord.correct) {
      setScore((s) => s + 1);
    }
    if (currentWordIndex < artikelWords.length - 1) {
      setCurrentWordIndex((i) => i + 1);
    } else {
      alert(`Spiel beendet! Du hast ${score + (artikel === currentWord.correct ? 1 : 0)} Punkte.`);
      resetGame();
    }
  };

  // ======= Wort-Memory (исправленная логика) =======
  // Словарь с emoji
  const wordList = useMemo(
    () => [
      { de: "Hund", en: "dog", emoji: "🐶" },
      { de: "Katze", en: "cat", emoji: "🐱" },
      { de: "Haus", en: "house", emoji: "🏠" },
      { de: "Buch", en: "book", emoji: "📚" },
      { de: "Auto", en: "car", emoji: "🚗" },
      { de: "Baum", en: "tree", emoji: "🌳" },
      { de: "Affe", en: "monkey", emoji: "🐒" },
      { de: "Apfel", en: "apple", emoji: "🍎" },
    ],
    []
  ];

  type Card = {
    id: string; // уникальный id карточки
    pairId: string; // идентификатор пары (одинаков для двух карточек-пары)
    content: string; // отображаемое (немецкое слово)
    emoji?: string; // emoji (опционально)
  };

  const [deck, setDeck] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]); // ids перевёрнутых сейчас
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [lockBoard, setLockBoard] = useState(false);

  // Инициализация/перемешивание колоды при старте Memory
  useEffect(() => {
    if (activeGame === "memory") {
      // Возьмём первые N слов (например, 6 пар) или весь список если нужен
      const pairs = wordList.slice(0, 6); // 6 пар = 12 карточек
      let tmpDeck: Card[] = [];

      pairs.forEach((w) => {
        const pairId = Math.random().toString(36).slice(2, 9);
        tmpDeck.push({
          id: pairId + "_a",
          pairId,
          content: w.de,
          emoji: w.emoji,
        });
        tmpDeck.push({
          id: pairId + "_b",
          pairId,
          content: w.de,
          emoji: w.emoji,
        });
      });

      // Перемешать
      tmpDeck = tmpDeck.sort(() => Math.random() - 0.5);
      setDeck(tmpDeck);
      setFlippedIds([]);
      setMatchedPairIds([]);
      setLockBoard(false);
    } else {
      // если выходим из memory, очистим
      setDeck([]);
      setFlippedIds([]);
      setMatchedPairIds([]);
      setLockBoard(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGame]);

  const handleFlip = (cardId: string) => {
    if (lockBoard) return;
    if (flippedIds.includes(cardId)) return; // уже перевёрнута
    const card = deck.find((c) => c.id === cardId);
    if (!card) return;

    // если уже одна карточка перевернута — пытаемся открыть вторую
    if (flippedIds.length === 1) {
      const firstId = flippedIds[0];
      const firstCard = deck.find((c) => c.id === firstId)!;

      // временно показываем вторую
      setFlippedIds([firstId, cardId]);
      // если пара совпадает — помечаем matched
      if (firstCard.pairId === card.pairId) {
        setMatchedPairIds((m) => [...m, firstCard.pairId]);
        // очистка перевёрнутых через короткое время (с анимацией)
        setTimeout(() => {
          setFlippedIds([]);
        }, 600);
      } else {
        // не совпадает — заблокируем доску и перевернём обратно
        setLockBoard(true);
        setTimeout(() => {
          setFlippedIds([]);
          setLockBoard(false);
        }, 800);
      }
    } else {
      // ещё нет открытых карточек — просто откроем одну
      setFlippedIds([cardId]);
    }
  };

  const resetGame = () => {
    setActiveGame(null);
    setScore(0);
    setCurrentWordIndex(0);
    // memory reset handled by effect on activeGame change
  };

  // ======= UI =======
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

      {/* Artikel-Quiz */}
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

      {/* Memory */}
      {activeGame === "memory" && (
        <div className={s.gameContainer}>
          <h2>Wort-Memory</h2>
          <p>Finde die Paare. Tippe auf zwei Karten, um zu vergleichen.</p>

          <div className={s.memoryGrid}>
            {deck.map((card) => {
              const isFlipped = flippedIds.includes(card.id) || matchedPairIds.includes(card.pairId);
              return (
                <div
                  key={card.id}
                  className={`${s.memoryCard} ${isFlipped ? s.flipped : ""}`}
                  onClick={() => {
                    // если уже совпала пара, клики игнорируем
                    if (matchedPairIds.includes(card.pairId)) return;
                    handleFlip(card.id);
                  }}
                >
                  {isFlipped ? (
                    <>
                      <div style={{ fontSize: 28 }}>{card.emoji ?? ""}</div>
                      <div style={{ fontSize: 16, marginTop: 6 }}>{card.content}</div>
                    </>
                  ) : (
                    <span style={{ fontSize: 32 }}>?</span>
                  )}
                </div>
              );
            })}
          </div>

          <button className={s.backButton} onClick={resetGame}>
            Zurück zur Auswahl
          </button>
        </div>
      )}
    </div>
  );
}
