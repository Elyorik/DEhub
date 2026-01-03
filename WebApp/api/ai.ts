import type { VercelRequest, VercelResponse } from "@vercel/node";

const LIMIT = 5;
const usage = new Map<string, { count: number; date: string }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip =
    (req.headers["x-forwarded-for"] as string) ||
    req.socket.remoteAddress ||
    "unknown";

  const today = new Date().toISOString().slice(0, 10);
  const user = usage.get(ip);

  if (!user || user.date !== today) {
    usage.set(ip, { count: 1, date: today });
  } else {
    if (user.count >= LIMIT) {
      return res.json({
        reply: "❌ Limit erreicht (5 Nachrichten pro Tag). Komm morgen wieder 🙂",
      });
    }
    user.count++;
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "No message" });
  }

  try {
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://dehub-webapp.vercel.app",
        "X-Title": "DEhub KI",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Du bist DEhub KI. Antworte kurz, klar und auf Deutsch.",
          },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await aiRes.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "❌ Keine Antwort von KI";

    return res.json({ reply });
  } catch (err) {
    return res.json({
      reply: "❌ Fehler beim Verbinden mit der KI",
    });
  }
}
