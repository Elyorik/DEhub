import { useState } from "react";
import s from "./suchen.module.scss";

type FileItem = {
  id: number;
  name: string;
  tags: string[];
};

const files: FileItem[] = [
  { id: 1, name: "DSD 1 Grammatik-Übung.pdf", tags: ["DSD 1", "Prüfungsvorbereitung"] },
  { id: 2, name: "DSD 2 Prüfung Aufgaben.docx", tags: ["DSD 2", "Prüfung"] },
  { id: 3, name: "Tipps zur Prüfungsvorbereitung.txt", tags: ["Prüfungsvorbereitung"] },
  { id: 4, name: "DSD 2 Hörverstehen.mp3", tags: ["DSD 2"] },
];

const filters = ["DSD 1", "DSD 2", "Prüfung", "Prüfungsvorbereitung"];

function Suchen() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredFiles = activeFilter
    ? files.filter((file) => file.tags.includes(activeFilter))
    : files;

  return (
    <div className={s.page}>
      <h1>Suche nach Dateien</h1>
      <div className={s.filters}>
        {filters.map((filter) => (
          <button
            key={filter}
            className={activeFilter === filter ? s.active : ""}
            onClick={() =>
              setActiveFilter(activeFilter === filter ? null : filter)
            }
          >
            {filter}
          </button>
        ))}
      </div>

      <div className={s.results}>
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <div key={file.id} className={s.fileCard}>
              <p>{file.name}</p>
              <small>{file.tags.join(", ")}</small>
            </div>
          ))
        ) : (
          <p>Keine Dateien gefunden.</p>
        )}
      </div>
    </div>
  );
}

export default Suchen;
