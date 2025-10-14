import { useState, useEffect } from "react";
import s from "./spiele.module.scss";
import derDieDasImg from "../../assets/SpieleImg/DerDieDas.png";
import memoryImg from "../../assets/SpieleImg/Memory.png";

type GameType = "menu" | "derDieDas" | "memory";

export default function Spiele() {
  const [selectedGame, setSelectedGame] = useState<GameType>("menu");

  // 🔹 Spiel 1 – Der / Die / Das
  const [word, setWord] = useState<string>("");
  const [article, setArticle] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const words = [
    { word: "Apfel", article: "der" },
    { word: "Hund", article: "der" },
    { word: "Tisch", article: "der" },
    { word: "Stuhl", article: "der" },
    { word: "Baum", article: "der" },
    { word: "Vogel", article: "der" },
    { word: "Ball", article: "der" },
    { word: "Bleistift", article: "der" },
    { word: "Computer", article: "der" },
    { word: "Zug", article: "der" },
    { word: "Banane", article: "die" },
    { word: "Katze", article: "die" },
    { word: "Lampe", article: "die" },
    { word: "Blume", article: "die" },
    { word: "Uhr", article: "die" },
    { word: "Tasche", article: "die" },
    { word: "Gitarre", article: "die" },
    { word: "Küche", article: "die" },
    { word: "Tür", article: "die" },
    { word: "Straße", article: "die" },
    { word: "Auto", article: "das" },
    { word: "Haus", article: "das" },
    { word: "Buch", article: "das" },
    { word: "Kind", article: "das" },
    { word: "Fenster", article: "das" },
    { word: "Bild", article: "das" },
    { word: "Bett", article: "das" },
    { word: "Telefon", article: "das" },
    { word: "Wasser", article: "das" },
    { word: "Mädchen", article: "das" },
  ];

  const getNewWord = () => {
    const random = words[Math.floor(Math.random() * words.length)];
    setWord(random.word);
    setArticle(random.article);
    setResult("");
  };

  const checkAnswer = (chosen: string) => {
    setResult(chosen === article ? "✅ Richtig!" : "❌ Falsch!");
    setTimeout(getNewWord, 1000);
  };

  useEffect(() => {
    if (selectedGame === "derDieDas") getNewWord();
  }, [selectedGame]);

  // 🔹 Spiel 2 – Memory
  const allEmojiWords = [
    "Affe 🐒", "Hund 🐶", "Katze 🐱", "Apfel 🍎", "Baum 🌳", "Auto 🚗", "Buch 📖",
    "Haus 🏠", "Sonne ☀️", "Mond 🌙", "Ball ⚽", "Herz ❤️", "Blume 🌸", "Pizza 🍕",
    "Musik 🎵", "Vogel 🐦", "Eis 🍦", "Fisch 🐟", "Feuer 🔥", "Schnee ❄️", "Berg 🏔️",
    "Kaffee ☕", "Tee 🍵", "Regen 🌧️", "Donner ⚡", "Wolke ☁️", "Brief ✉️", "Schlüssel 🔑",
    "Uhr ⏰", "Rakete 🚀", "Brot 🍞", "Käse 🧀", "Kuchen 🍰", "Telefon 📱", "Kamera 📷",
    "Laptop 💻", "Stift ✏️", "Zebra 🦓", "Tiger 🐅", "Elefant 🐘", "Giraffe 🦒",
    "Eule 🦉", "Biene 🐝", "Schmetterling 🦋", "Schaf 🐑", "Pferd 🐎", "Schwein 🐷",
    "Torte 🎂", "Kirsche 🍒", "Traube 🍇", "Melone 🍉", "Karotte 🥕", "Kaktus 🌵",
  ];

  type Card = {
    id: number;
    value: string;
    flipped: boolean;
    matched: boolean;
  };

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [lockBoard, setLockBoard] = useState(false);

  useEffect(() => {
    if (selectedGame === "memory") {
      // 🎲 выбираем 8 случайных пар (всего 16 карт)
      const chosenWords = allEmojiWords.sort(() => Math.random() - 0.5).slice(0, 8);
      const pairs = chosenWords.flatMap((word) => [word, word]);
      const shuffled = pairs
        .sort(() => Math.random() - 0.5)
        .map((val, i) => ({ id: i, value: val, flipped: false, matched: false }));
      setCards(shuffled);
    }
  }, [selectedGame]);

  const handleFlip = (id: number) => {
    if (lockBoard) return;
    const newCards = [...cards];
    const clicked = newCards.find((c) => c.id === id);
    if (!clicked || clicked.flipped || clicked.matched) return;

    clicked.flipped = true;
    setCards(newCards);
    const flippedNow = [...flippedCards, id];
    setFlippedCards(flippedNow);

    if (flippedNow.length === 2) {
      setLockBoard(true);
      const [first, second] = flippedNow.map((i) => newCards.find((c) => c.id === i)!);

      if (first.value === second.value) {
        first.matched = true;
        second.matched = true;
        setTimeout(() => {
          setFlippedCards([]);
          setLockBoard(false);
        }, 600);
      } else {
        setTimeout(() => {
          first.flipped = false;
          second.flipped = false;
          setCards([...newCards]);
          setFlippedCards([]);
          setLockBoard(false);
        }, 700);
      }
    }
  };

  return (
    <div className={s.wrapper}>
      {selectedGame === "menu" && (
        <div className={s.menu}>
          <h1>🎮 Spiele</h1>
          <p>Wähle ein Spiel, um dein Deutsch zu verbessern!</p>

          <div className={s.gamesGrid}>
            <div className={s.card} onClick={() => setSelectedGame("derDieDas")}>
              <img src={derDieDasImg} alt="Der Die Das" />
              <div className={s.cardTitle}>Der / Die / Das</div>
            </div>
            <div className={s.card} onClick={() => setSelectedGame("memory")}>
              <img src={memoryImg} alt="Memory Spiel" />
              <div className={s.cardTitle}>Memory</div>
            </div>
          </div>
        </div>
      )}

      {selectedGame === "derDieDas" && (
        <div className={s.gameContainer}>
          <h2>🧩 Der / Die / Das</h2>
          <h3>{word}</h3>
          <div className={s.buttons}>
            <button onClick={() => checkAnswer("der")}>der</button>
            <button onClick={() => checkAnswer("die")}>die</button>
            <button onClick={() => checkAnswer("das")}>das</button>
          </div>
          <p>{result}</p>
          <button className={s.backButton} onClick={() => setSelectedGame("menu")}>
            ⬅️ Zurück zur Auswahl
          </button>
        </div>
      )}

      {selectedGame === "memory" && (
        <div className={s.gameContainer}>
          <h2>🧠 Memory-Spiel</h2>
          <div className={s.memoryGrid}>
            {cards.map((card) => (
              <div
                key={card.id}
                className={`${s.memoryCard} ${
                  card.flipped || card.matched ? s.flipped : ""
                }`}
                onClick={() => handleFlip(card.id)}
              >
                {card.flipped || card.matched ? card.value : "❓"}
              </div>
            ))}
          </div>
          <button className={s.backButton} onClick={() => setSelectedGame("menu")}>
            ⬅️ Zurück zur Auswahl
          </button>
        </div>
      )}
    </div>
  );
}
