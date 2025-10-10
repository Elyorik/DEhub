import { useEffect, useState } from "react";
import s from "./neuigkeiten.module.scss";

interface Article {
  title: string;
  link: string;
  contentSnippet: string;
  source: string;
  image?: string | null;
  pubDate?: string;
}

const ONE_DAY = 24 * 60 * 60 * 1000;

export default function Neuigkeiten() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/neuigkeiten");
      const data = await res.json();
      setArticles(data.items || []);
      setFetchedAt(data.fetchedAt || Date.now());
    } catch (err) {
      console.error("Fehler beim Laden der News:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, ONE_DAY);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={s.page}>
      <h1>Neuigkeiten</h1>
      <div style={{ marginBottom: 8, fontSize: 13, color: "#666" }}>
        {fetchedAt ? `Zuletzt aktualisiert: ${new Date(fetchedAt).toLocaleString()}` : ""}
      </div>

      {loading && <div>Lade News…</div>}

      <div className={s.results}>
        {articles.map((a, i) => (
          <a
            key={i}
            href={a.link}
            target="_blank"
            rel="noopener noreferrer"
            className={s.card}
          >
            <div
              className={s.bg}
              style={{
                backgroundImage: a.image ? `url(${a.image})` : "none",
              }}
            />
            <div className={s.overlay}>
              <h2>{a.title}</h2>
              <p>{a.contentSnippet}</p>
              <div className={s.source}>
                {a.source}{" "}
                {a.pubDate ? `• ${new Date(a.pubDate).toLocaleString()}` : ""}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
