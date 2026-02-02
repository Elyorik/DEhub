import React, { useState } from "react";
import s from "./quellen.module.scss";
import { ChevronDown } from "lucide-react";

interface Quelle {
  name: string;
  url: string;
  kategorie: string;
}

const quellenListe: Quelle[] = [
  // 🎓 Studium / Studienkolleg / Deutsch
  { name: "Studienkollegs Deutschland (Übersicht)", url: "https://studienkollegs.de/", kategorie: "Studium" },
  { name: "Studienkolleg Aufnahmetests – Beispiele", url: "https://studienkollegs-in.de/aufnahmetest/beispiele", kategorie: "Studium" },
  { name: "C-Test Deutsch – Modelle & Übungen", url: "https://deutschlernbeg.de/c-test-deutsch-modelle-online-und-als-pdf/", kategorie: "Studium" },
  { name: "PASCH – Deutsch lernen weltweit", url: "https://www.pasch-net.de/de/index.html", kategorie: "Studium" },
  { name: "Goethe-Institut Übungen A1–C2", url: "https://www.goethe.de/de/spr/ueb.html", kategorie: "Studium" },
  { name: "LearnGerman DW – Deutsch lernen", url: "https://learngerman.dw.com/de/deutsch-lernen/s-9095", kategorie: "Studium" },
  { name: "Deutsch lernen C1 – DW", url: "https://learngerman.dw.com/de/deutsch-lernen/c1-deutschkurs-c1/", kategorie: "Studium" },
  { name: "Deutsch lernen Übungen – DW", url: "https://www.dw.com/de/deutsch-lernen/s-2055", kategorie: "Studium" },

  // 💶 Finanzen / Sperrkonto / Lebenshaltungskosten
  { name: "DAAD – Leben & Studieren in Deutschland", url: "https://www.daad.de/de/in-deutschland-studieren/leben-in-deutschland/finanzen/", kategorie: "Finanzen" },
  { name: "Study in Germany – Finanzierung", url: "https://www.study-in-germany.com/de/studium-planen/vorbereitungen/finanzierung/", kategorie: "Finanzen" },
  { name: "Studierendenwerke Deutschland", url: "https://www.studierendenwerke.de/", kategorie: "Finanzen" },
  { name: "Expatrio – Sperrkonto", url: "https://www.expatrio.com", kategorie: "Finanzen" },
  { name: "Fintiba – Sperrkonto", url: "https://www.fintiba.com", kategorie: "Finanzen" },

  // 🪪 Visa / Einreise
  { name: "Deutsche Botschaft Taschkent – Visa", url: "https://taschkent.diplo.de/uz-de/service/05-visaeinreise", kategorie: "Visa" },
  { name: "Visa & Einreise – Deutschland", url: "https://taschkent.diplo.de/uz-de/service/05-visaeinreise/2445770-2445770", kategorie: "Visa" },
  { name: "Auswärtiges Amt – Studium & Visa", url: "https://www.auswaertiges-amt.de/de/bildung/studium", kategorie: "Visa" },

  // 💼 Arbeit / Ausbildung / Jobs
  { name: "Bundesagentur für Arbeit – Startseite", url: "https://www.arbeitsagentur.de/vor-ort/zav/startseite", kategorie: "Arbeit" },
  { name: "Bundesagentur für Arbeit – Jobsuche", url: "https://www.arbeitsagentur.de/jobsuche/", kategorie: "Arbeit" },
  { name: "Bundesagentur für Arbeit – Berufenet", url: "https://www.berufenet.arbeitsagentur.de", kategorie: "Arbeit" },
  { name: "Ausbildung.de", url: "https://www.ausbildung.de", kategorie: "Arbeit" },

  // 🎓 Hochschulen & Bewerbung
  { name: "Hochschulkompass – Studienplatzbörse", url: "https://www.hochschulkompass.de/studium/studienplatzboerse.html", kategorie: "Studium" },
  { name: "Studieren ohne Abitur", url: "https://studieren-ohne-abitur.de/", kategorie: "Studium" },
];

const kategorien = [
  { name: "Studium", icon: "🎓" },
  { name: "Arbeit", icon: "💼" },
  { name: "Finanzen", icon: "💶" },
  { name: "Visa", icon: "🪪" },
];

export default function Quellen() {
  const [open, setOpen] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const toggle = (kat: string) => {
    setOpen(open === kat ? null : kat);
  };

  const gefilterteQuellen = quellenListe.filter((q) =>
    q.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = async (url: string) => {
    console.log("Try open link:", url);

    try {
      // 1) Telegram WebApp API (works inside Telegram mobile WebApp)
      if ((window as any).Telegram?.WebApp?.openLink) {
        console.log("Using Telegram.WebApp.openLink");
        (window as any).Telegram.WebApp.openLink(url);
        return;
      }

      // 2) Try window.open
      const newWin = window.open(url, "_blank", "noopener,noreferrer");
      if (newWin) {
        console.log("Opened with window.open");
        return;
      }

      // 3) Create anchor and click it (fallback)
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      console.log("Opened by dynamic anchor click");
      return;
    } catch (err) {
      console.error("Opening link failed (try direct location):", err);
    }

    // 4) Last resort — change location
    try {
      window.location.href = url;
      console.log("Opened by location.href");
    } catch (err) {
      console.error("All open attempts failed:", err);
      alert("Не удалось открыть ссылку. Попробуй открыть страницу в обычном браузере.");
    }
  };

  return (
    <div className={s.container}>
      <h1>📚 Nützliche Quellen</h1>

      <input
        type="text"
        placeholder="🔍 Quelle suchen..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={s.search}
      />

      <div className={s.folders}>
        {kategorien.map((kat) => {
          const items = gefilterteQuellen.filter((q) => q.kategorie === kat.name);
          if (items.length === 0) return null;

          return (
            <div key={kat.name} className={s.folder}>
              <button className={s.folderButton} onClick={() => toggle(kat.name)}>
                <span>
                  {kat.icon} {kat.name}
                </span>
                <ChevronDown
                  className={`${s.icon} ${open === kat.name ? s.open : ""}`}
                  size={20}
                />
              </button>

              <div className={`${s.list} ${open === kat.name ? s.show : ""}`}>
                {items.map((q) => (
                  <span
                    key={q.url}
                    onClick={() => handleOpen(q.url)}
                    className={s.link}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") handleOpen(q.url); }}
                    style={{ cursor: "pointer", display: "block", padding: "6px 0" }}
                  >
                    {q.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
