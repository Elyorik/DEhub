import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "media", { keepArray: true }],
      ["enclosure", "enclosure"],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

const feeds = [
  { url: "https://www.spiegel.de/schlagzeilen/tops/index.rss", source: "Spiegel" },
  { url: "https://www.tagesschau.de/xml/rss2", source: "Tagesschau" },
  { url: "https://newsfeed.zeit.de/index", source: "Zeit" },
];

// Helper: extract image
function extractImage(item) {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item.media?.[0]?.$?.url) return item.media[0].$.url;
  const html = item.contentEncoded || item["content:encoded"] || item.content || "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export default async function handler(req, res) {
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
          source: f.source,
          image: extractImage(item),
        }));
        all = all.concat(items);
      } catch (err) {
        console.error(`[news] feed error ${f.url}:`, err.message);
      }
    }

    all.sort((a, b) => {
      const ta = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const tb = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return tb - ta;
    });

    res.status(200).json({
      fetchedAt: Date.now(),
      items: all.slice(0, 100),
    });
  } catch (err) {
    console.error("[news] fatal error:", err);
    res.status(500).json({ error: "Failed to fetch news." });
  }
}
