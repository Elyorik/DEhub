// server.js (ESM - package.json: "type": "module")
import express from "express";
import cors from "cors";
import Parser from "rss-parser";

const app = express();
app.use(cors());

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "media", { keepArray: true }],
      ["enclosure", "enclosure"],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

// <-- Passe hier deine Quellen an -->
const feeds = [
  { url: "https://www.spiegel.de/schlagzeilen/tops/index.rss", source: "Spiegel" },
  { url: "https://www.tagesschau.de/xml/rss2", source: "Tagesschau" },
  { url: "https://newsfeed.zeit.de/index", source: "Zeit" },
];

let cachedNews = [];
let lastFetchTime = 0;
const ONE_DAY = 24 * 60 * 60 * 1000;

// Hilfsfunktion: extrahiere Bild (falls vorhanden)
function extractImage(item) {
  // 1) enclosure.url
  if (item.enclosure?.url) return item.enclosure.url;
  // 2) media:content
  if (item.media?.[0]?.$?.url) return item.media[0].$.url;
  // 3) contentEncoded: suche erstes <img src="...">
  const html = item.contentEncoded || item["content:encoded"] || item.content || "";
  const match = html && html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match) return match[1];
  return null;
}

async function fetchAndCache() {
  console.log("[news] fetching feeds...");
  try {
    let all = [];
    for (const f of feeds) {
      try {
        const parsed = await parser.parseURL(f.url);
        const items = (parsed.items || []).map((item) => ({
          title: item.title || "",
          link: item.link || "",
          contentSnippet: (item.contentSnippet || item.content || "").slice(0, 300),
          pubDate: item.pubDate || "",
          source: f.source || parsed.title || "Quelle",
          image: extractImage(item),
        }));
        all = all.concat(items);
      } catch (err) {
        console.error(`[news] feed error ${f.url}:`, err.message || err);
      }
    }

    // sortiere nach pubDate falls vorhanden
    all.sort((a, b) => {
      const ta = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const tb = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return tb - ta;
    });

    // speichere Cache (z.B. Top 200)
    cachedNews = all.slice(0, 200);
    lastFetchTime = Date.now();
    console.log("[news] fetched and cached, count:", cachedNews.length, "at", new Date(lastFetchTime).toISOString());
  } catch (err) {
    console.error("[news] fatal fetch error:", err.message || err);
  }
}

// beim Start einmal laden
await fetchAndCache(); // ESM + Node >= 14+ erlaubt top-level await

// täglich automatisch neu laden
setInterval(fetchAndCache, ONE_DAY);

// Endpoint: liefer Cache
app.get("/news", (req, res) => {
  res.json({
    fetchedAt: lastFetchTime,
    items: cachedNews,
  });
});

// Dev endpoint: erzwinge Refresh (kann entfernt/geschützt werden)
app.get("/news/refresh", async (req, res) => {
  await fetchAndCache();
  res.json({ ok: true, fetchedAt: lastFetchTime, count: cachedNews.length });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 News backend läuft auf http://localhost:${PORT}/news`));
