import type { VercelRequest, VercelResponse } from "@vercel/node";

const LIMIT = 5;
const usage = new Map<string, { count: number; date: string }>();

// Mock AI для разработки без API ключа
async function mockAI(message: string): Promise<string> {
  await new Promise(r => setTimeout(r, 600));
  return `🧪 Test-Modus (DEV)

Du hast geschrieben: "${message}"

⚠️ Die echte KI ist nicht konfiguriert. Bitte OPENROUTER_API_KEY in den Umgebungsvariablen hinzufügen.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const today = new Date().toISOString().slice(0, 10);
  const user = usage.get(ip);

  // Проверка лимита
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
  if (!message) return res.status(400).json({ error: "No message" });

  // Проверка наличия API ключа
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    const reply = await mockAI(message);
    return res.json({ reply });
  }

  try {
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://dehub-webapp.vercel.app",
        "X-Title": "DEhub KI",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "nex-agi/deepseek-v3.1-nex-n1:free",
        messages: [
          {
            role: "system",
            content: "Du bist DEhub KI. Antworte kurz, klar und auf Deutsch."
          },
          { role: "user", content: message }
        ],
      }),
    });

    const data = await aiRes.json();

    const reply = data?.choices?.[0]?.message?.content ?? "❌ Keine Antwort von KI";

    return res.json({ reply });
  } catch (err) {
    console.error(err);
    // Fallback на mock при ошибке
    const reply = await mockAI(message);
    return res.json({ reply });
  }
}
