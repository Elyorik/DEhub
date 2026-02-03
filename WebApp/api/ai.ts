import type { VercelRequest, VercelResponse } from "@vercel/node";

const LIMIT = 5;
const usage = new Map<string, { count: number; date: string }>();

// Google Gemini AI - Free tier available
async function getGeminiReply(message: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  
  // If no API key, use a simple local response
  if (!apiKey) {
    return simpleLocalAI(message);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Du bist DEhub KI, ein hilfreicher Assistent auf Deutsch. Antworte kurz und klar auf Deutsch.

Benutzerfrage: ${message}`
          }]
        }]
      })
    });

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Keine Antwort von KI";
  } catch (err) {
    console.error("Gemini API error:", err);
    return simpleLocalAI(message);
  }
}

// Simple local AI fallback - works without API key
function simpleLocalAI(message: string): string {
  const lowerMsg = message.toLowerCase();
  
  // Simple keyword-based responses for common questions
  if (lowerMsg.includes("hallo") || lowerMsg.includes("hello")) {
    return "👋 Hallo! Ich bin DEhub KI. Ich bin ein einfacher Assistent, der dir bei allgemeinen Fragen helfen kann. Was möchtest du wissen?";
  }
  
  if (lowerMsg.includes("wer") && lowerMsg.includes("du")) {
    return "Ich bin DEhub KI, ein KI-Assistent für diese Webseite. Ich wurde entwickelt, um Schülern und Studenten bei Fragen zu helfen.";
  }
  
  if (lowerMsg.includes("hilfe") || lowerMsg.includes("help")) {
    return "💡 Ich kann dir bei folgenden Themen helfen: Fragen beantworten, Texte erklaeren, Bei Hausaufgaben unterstuetzen, Deutsche Sprache ueben. Was moechtest du wissen?";
  }
  
  if (lowerMsg.includes("danke")) {
    return "Gerne geschehen! 😊 Ich helfe dir gerne bei weiteren Fragen.";
  }
  
  if (lowerMsg.includes("zeit") || lowerMsg.includes("uhr")) {
    return `Aktuelle Zeit: ${new Date().toLocaleTimeString("de-DE")}`;
  }
  
  if (lowerMsg.includes("datum") || lowerMsg.includes("datum")) {
    return `Heute ist: ${new Date().toLocaleDateString("de-DE")}`;
  }
  
  // Default response
  return `📝 Ich habe deine Nachricht erhalten: "${message}"

⚠️ Für detailliertere Antworten kannst du eine vollständige KI wie Google Gemini mit einem API-Key konfigurieren.

Aber ich kann dir bei einfachen Fragen helfen. Was möchtest du wissen?`;
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

  // Get response from Gemini or local fallback
  const reply = await getGeminiReply(message);
  
  return res.json({ reply });
}
