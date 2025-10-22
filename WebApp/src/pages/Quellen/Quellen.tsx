import React, { useState } from "react";
import s from "./quellen.module.scss";
import { ChevronDown } from "lucide-react";

interface Quelle {
  name: string;
  url: string;
  kategorie: string;
}

const quellenListe: Quelle[] = [
  // 🎓 Studium
  { name: "Uni-Assist", url: "https://www.uni-assist.de", kategorie: "Studium" },
  { name: "DAAD – Deutscher Akademischer Austauschdienst", url: "https://www.daad.de/de", kategorie: "Studium" },
  { name: "Hochschulkompass", url: "https://www.hochschulkompass.de", kategorie: "Studium" },
  { name: "Study in Germany", url: "https://www.study-in-germany.de", kategorie: "Studium" },
  { name: "BMBF Stipendienlotse", url: "https://www.stipendienlotse.de", kategorie: "Studium" },
  { name: "PASCH", url: "https://www.pasch-net.de/de/index.html", kategorie: "Studium" },

  // 💼 Arbeit
  { name: "Bundesagentur für Arbeit", url: "https://www.arbeitsagentur.de", kategorie: "Arbeit" },
  { name: "Make it in Germany", url: "https://www.make-it-in-germany.com", kategorie: "Arbeit" },
  { name: "Anerkennung in Deutschland", url: "https://www.anerkennung-in-deutschland.de", kategorie: "Arbeit" },
  { name: "Ausbildung.de", url: "https://www.ausbildung.de", kategorie: "Arbeit" },
  { name: "Handwerkskammer", url: "https://www.handwerkskammer.de", kategorie: "Arbeit" },

  // 💶 Finanzen
  { name: "Expatrio (Sperrkonto)", url: "https://www.expatrio.com", kategorie: "Finanzen" },
  { name: "Fintiba (Sperrkonto)", url: "https://www.fintiba.com", kategorie: "Finanzen" },
  { name: "Deutsche Bank Sperrkonto", url: "https://www.deutsche-bank.de/sperrkonto", kategorie: "Finanzen" },
  { name: "Sparkasse International Students", url: "https://www.sparkasse.de", kategorie: "Finanzen" },
  { name: "Commerzbank International", url: "https://www.commerzbank.de", kategorie: "Finanzen" },

  // 🪪 Visa
  { name: "Auswärtiges Amt", url: "https://www.auswaertiges-amt.de", kategorie: "Visa" },
  { name: "BAMF – Migration und Flüchtlinge", url: "https://www.bamf.de", kategorie: "Visa" },
  { name: "Einreise nach Deutschland", url: "https://www.germany-visa.org", kategorie: "Visa" },
  { name: "Termin bei der Botschaft", url: "https://taschkent.diplo.de/uz-de", kategorie: "Visa" },

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
                  <a key={q.url} href={q.url} target="_blank" rel="noopener noreferrer">
                    {q.name}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
