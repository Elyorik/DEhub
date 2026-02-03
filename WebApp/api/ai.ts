import type { VercelRequest, VercelResponse } from "@vercel/node";

const LIMIT = 5;
const usage = new Map<string, { count: number; date: string }>();

// Google Gemini API - Free tier available (15 requests/minute, 1500/day)
async function getGeminiReply(message: string): Promise<string> {
  // Try environment variable first, otherwise use a demo key placeholder
  // Note: For production, set GEMINI_API_KEY in Vercel environment variables
  const apiKey = process.env.GEMINI_API_KEY || "DEMO_KEY";
  
  try {
    // Gemini 1.5 Flash - Fast and capable, has generous free tier
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Du bist DEhub KI, ein freundlicher und hilfreicher Assistent auf Deutsch. Antworte kurz, klar und nuetzlich.

Benutzer: ${message}

Antworte auf Deutsch:`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return reply.trim();
    } else if (response.status === 503) {
      // Model overloaded, try fallback
      console.log("Gemini 1.5 Flash busy, trying fallback...");
    }
  } catch (err) {
    console.error("Gemini API error:", err);
  }
  
  return "";
}

// Groq API - Free tier with fast inference (requires API key for full access)
async function getGroqReply(message: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY || "";
  if (!apiKey) return "";
  
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "Du bist DEhub KI. Antworte kurz und hilfreich auf Deutsch." },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data?.choices?.[0]?.message?.content || "";
    }
  } catch (err) {
    console.error("Groq API error:", err);
  }
  
  return "";
}

// Simple local AI as final fallback - enhanced version
function simpleLocalAI(message: string): string {
  const lowerMsg = message.toLowerCase();
  const words = lowerMsg.split(/\s+/);
  
  // Greetings
  if (lowerMsg.match(/\b(hallo|hello|guten tag|moin|hey|greetings)\b/)) {
    return "Hallo! Ich bin DEhub KI. Wie kann ich dir heute helfen? Ich bin ein einfacher Assistent, der dir bei Fragen und Aufgaben unterstuetzen kann.";
  }
  
  // Who are you
  if (lowerMsg.includes("wer bist du") || lowerMsg.includes("was bist du") || lowerMsg.includes("beschreibe dich")) {
    return "Ich bin DEhub KI, der digitale Assistent dieser Webseite. Ich wurde entwickelt, um Schuelern, Studenten und Besuchern bei verschiedenen Fragen zu helfen - von Hausaufgaben bis hin zu allgemeinen Informationen.";
  }
  
  // Help
  if (lowerMsg.includes("hilfe") || lowerMsg.includes("help") || lowerMsg.includes("was kannst du")) {
    return "Ich kann dir bei vielen Dingen helfen: Fragen beantworten, Texte erklaeren und zusammenfassen, Bei Hausaufgaben unterstuetzen, Deutsche Sprache ueben, Ideen und Anregungen geben, Alltagsfragen beantworten. Was moechtest du wissen?";
  }
  
  // Thanks
  if (lowerMsg.includes("danke") || lowerMsg.includes("vielen dank")) {
    return "Gerne geschehen! Ich bin froh, dass ich helfen konnte. Bei weiteren Fragen stehe ich dir gerne zur Verfuegung.";
  }
  
  // Time/Date
  if (lowerMsg.includes("zeit") || lowerMsg.includes("uhr") || lowerMsg.includes("wie spaet")) {
    return `Aktuelle Zeit: ${new Date().toLocaleTimeString("de-DE")}. Das Datum heute ist: ${new Date().toLocaleDateString("de-DE")}.`;
  }
  
  // Weather (basic)
  if (lowerMsg.includes("wetter") || lowerMsg.includes("temperatur") || lowerMsg.includes("regen")) {
    return "Ich habe keinen Zugriff auf Wetterdaten. Du kannst eine Wetter-App oder Webseite wie wetter.com oder accuweather.com dafuer nutzen.";
  }
  
  // Math basic
  if (lowerMsg.match(/\d+\s*[+\-*/]\s*\d+/) || lowerMsg.includes("berechne") || lowerMsg.includes("was ist")) {
    return "Fuer mathematische Berechnungen kann ich dir helfen, aber komplexe Probleme loese ich am besten mit Stift und Papier. Was moechtest du berechnen?";
  }
  
  // Goodbye
  if (lowerMsg.match(/\b(tschuess|auf wiedersehen|bye|goodbye|servus)\b/)) {
    return "Auf Wiedersehen! Ich hoffe, wir sehen uns bald wieder. Bis dahin alles Gute!";
  }
  
  // Default response
  return `Ich habe deine Nachricht "${message}" erhalten. Als einfacher Assistent kann ich dir bei grundlegenden Fragen helfen. Was moechtest du sonst noch wissen?`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const today = new Date().toISOString().slice(0, 10);
  const user = usage.get(ip);

  // Check limit
  if (!user || user.date !== today) {
    usage.set(ip, { count: 1, date: today });
  } else {
    if (user.count >= LIMIT) {
      return res.json({
        reply: "Limit erreicht (5 Nachrichten pro Tag). Komm morgen wieder.",
      });
    }
    user.count++;
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message" });

  // Try Gemini first (has generous free tier)
  let reply = await getGeminiReply(message);
  
  // Fallback to Groq if Gemini fails
  if (!reply) {
    reply = await getGroqReply(message);
  }
  
  // Final fallback to local AI
  if (!reply) {
    reply = simpleLocalAI(message);
  }
  
  return res.json({ reply });
}
