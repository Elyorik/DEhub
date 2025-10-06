import { useState, useEffect } from "react";
import filesData from "./files.json"; // JSON importieren
import s from "./suchen.module.scss";

type FileItem = {
  id: number;
  name: string;
  url: string;
  tags: string[];
};

function Suchen() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // alle möglichen Tags automatisch aus JSON sammeln
  const allTags = Array.from(
    new Set(files.flatMap((file) => file.tags))
  ).sort();

  useEffect(() => {
    setFiles(filesData as FileItem[]);
  }, []);

  // Toggle für Tags
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Filter anwenden
  const filteredFiles = files.filter((file) => {
    const matchSearch = file.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => file.tags.includes(tag));

    return matchSearch && matchTags;
  });

  return (
    <div className={s.page}>
      <h1>📂 Suchmaschine</h1>

      {/* Suchfeld */}
      <input
        type="text"
        placeholder="Dateien suchen..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={s.searchInput}
      />

      {/* Tag-Filter */}
      <div className={s.filters}>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={selectedTags.includes(tag) ? s.active : ""}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Ergebnisse */}
      <div className={s.results}>
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className={s.fileCard}
            >
              <p>{file.name}</p>
              <small>{file.tags.join(" / ")}</small>
            </a>
          ))
        ) : (
          <p>❌ Keine Dateien gefunden.</p>
        )}
      </div>
    </div>
  );
}

export default Suchen;
