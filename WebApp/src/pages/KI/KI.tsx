import { useState, useEffect } from "react";
import s from "./ki.module.scss";
import { canUseAI, getRemainingRequests } from "./aiLimit";

type Msg = {
  role: "user" | "ai";
  text: string;
};

export default function KI() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitError, setLimitError] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    setRemaining(getRemainingRequests());
  }, []);

  async function send() {
    if (!input.trim() || loading) return;

    // Check limit
    if (!canUseAI()) {
      setLimitError(true);
      return;
    }

    const userMsg: Msg = { role: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setLimitError(false);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });

      const data = await res.json();

      const aiMsg: Msg = { role: "ai", text: data.reply };
      setMessages((m) => [...m, aiMsg]);
      setRemaining(getRemainingRequests());
    } catch {
      const errorMsg: Msg = { role: "ai", text: "❌ Server nicht erreichbar" };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.page}>
      <div className={s.limitInfo}>
        💡 Kostenlos • Max. 5 Anfragen pro Tag • Noch {remaining} verfügbar
      </div>
      
      {limitError && (
        <div className={s.limitError}>
          ❌ Tageslimit erreicht (5/5). Komm morgen wieder 🙂
        </div>
      )}

      <div className={s.chatBox}>
        <div className={s.messages}>
          {messages.length === 0 && (
            <div className={s.welcome}>
              👋 Hallo! Ich bin DEhub KI.
              <br />
              Ich kann dir bei Fragen helfen, Texte erklären oder beim Lernen unterstützen.
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? s.user : s.ai}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className={s.inputRow}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Frag DEhub KI etwas…"
            onKeyDown={(e) => e.key === "Enter" && send()}
            disabled={loading || limitError}
          />
          <button onClick={send} disabled={loading || limitError}>
            {loading ? "…" : "Senden"}
          </button>
        </div>
      </div>
    </div>
  );
}
