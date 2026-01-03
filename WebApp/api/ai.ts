import type { VercelRequest, VercelResponse } from "@vercel/node";

const LIMIT = 5;

// очень простой лимит по IP (для старта норм)
const usage = new Map<string, { count: number; date: string }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const today = new Date().toISOString().slice(0, 10);

  const user = usage.get(ip as string);

  if (!user || user.date !== today) {
    usage.set(ip as string, { count: 1, date: today });
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

  // 🔥 ВРЕМЕННО: эхо-ответ (чтобы убедиться, что всё работает)
  // ⬇⬇⬇ потом сюда подключишь OpenAI / DeepSeek
  return res.json({
    reply: `🤖 AI Antwort:\n${message}`,
  });
}
