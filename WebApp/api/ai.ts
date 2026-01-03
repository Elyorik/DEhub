import type { VercelRequest, VercelResponse } from "@vercel/node";

const DAILY_LIMIT = 3;
const usage = new Map<string, { date: string; count: number }>();

function canUseAI(key: string): boolean {
  const today = new Date().toISOString().slice(0, 10);

  if (!usage.has(key)) usage.set(key, { date: today, count: 0 });

  const entry = usage.get(key)!;

  if (entry.date !== today) {
    entry.date = today;
    entry.count = 0;
  }

  if (entry.count >= DAILY_LIMIT) return false;

  entry.count += 1;
  return true;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress ||
    "unknown";

  if (!canUseAI(ip)) {
    return res.status(429).json({
      answer: "Ich bin ein kostenloses KI-Modell, komm morgen wieder 🙂",
    });
  }

  const { message } = req.body as { message?: string };

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  // --- Тестовый режим ---
  if (!process.env.OPENROUTER_API_KEY) {
    console.log("⚠️ OPENROUTER_API_KEY не найден, возвращаем тестовый ответ");
    return res.status(200).json({ answer: "✅ Test: AI работает!" });
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://dehub-webapp.vercel.app",
          "X-Title": "DEhub KI",
        },
        body: JSON.stringify({
          model: "nex-agi/deepseek-v3.1-nex-n1:free",
          messages: [
            { role: "system", content: "Du bist ein hilfreicher Assistent." },
            { role: "user", content: message },
          ],
        }),
      }
    );

    const data = await response.json();

    return res.status(200).json({
      answer: data?.choices?.[0]?.message?.content ?? "❌ Keine Antwort",
    });
  } catch (e) {
    console.error("AI Error:", e);
    return res.status(500).json({ answer: "❌ Serverfehler beim AI" });
  }
}
