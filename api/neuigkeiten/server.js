// api/neuigkeiten/server.js
// ✅ Vercel-ready RSS Proxy (ESM)
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

// 🔹 RSS-Quellen
const feeds = [
  { url: "https://www.spiegel.de/schlagzeilen/tops/index.rss", source: "Spiegel" },
  { url: "https://www.tagesschau.de/xml/rss2", source: "Tagesschau" },
  { url: "https://newsfeed.zeit.de/index", source: "Zeit" },
];

// 🔹 Cache
let cachedNews = [];
let lastFetchTime = 0;
const ONE_DAY = 24 * 60 * 60 * 1000;

// 🧩 Hilfsfunktion zum Extrahieren von Bildern
function extractImage(item) {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item.media?.[0]?.$?.url) return item.media[0].$.url;
  const html = item.contentEncoded || item["content:encoded"] || item.content || "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

// 🔹 News abrufen & cachen
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

    all.sort((a, b) => {
      const ta = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const tb = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return tb - ta;
    });

    cachedNews = all.slice(0, 200);
    lastFetchTime = Date.now();
    console.log("[news] cached", cachedNews.length, "articles");
  } catch (err) {
    console.error("[news] fatal fetch error:", err.message || err);
  }
}

// 🔹 Beim Start einmal laden
await fetchAndCache();

// 🔹 Endpoint für Vercel Frontend: /api/neuigkeiten
app.get("/api/neuigkeiten", (req, res) => {
  res.status(200).json({
    fetchedAt: lastFetchTime,
    items: cachedNews,
  });
});

// 🔹 Optional: manuelles Refresh (Admin/Debug)
app.get("/api/neuigkeiten/refresh", async (req, res) => {
  await fetchAndCache();
  res.status(200).json({
    ok: true,
    fetchedAt: lastFetchTime,
    count: cachedNews.length,
  });
});

// ✅ Export für Vercel (nicht listen!)
export default app;
