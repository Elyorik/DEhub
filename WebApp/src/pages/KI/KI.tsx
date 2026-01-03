import { useState } from "react";
import s from "./ki.module.scss";
import { canUseAI } from "./aiLimit";

type Msg = {
  role: "user" | "ai";
  text: string;
};

export default function KI() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const isProd = import.meta.env.PROD;

  async function send() {
    if (!input.trim() || loading) return;

    // 🔒 LIMIT 5 / день
    if (!canUseAI()) {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "Ich bin ein kostenloses KI-Modell, komm morgen wieder 🙂",
        },
      ]);
      return;
    }

    const userText = input;
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    let answer = "";

    try {
      if (!isProd) {
        // DEV → mock
        const { mockAI } = await import("./aiMock");
        answer = await mockAI(userText);
      } else {
        // PROD → real AI
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userText }),
        });

        if (!res.ok) throw new Error("Server error");

        const data = await res.json();
        answer = data.answer;
      }
    } catch {
      answer = "❌ Server nicht erreichbar";
    }

    setMessages((m) => [...m, { role: "ai", text: answer }]);
    setLoading(false);
  }

  return (
    <div className={s.page}>
      <div className={s.chat}>
        <div className={s.messages}>
          {messages.map((m, i) => (
            <div key={i} className={s[m.role]}>
              {m.text}
            </div>
          ))}
          {loading && <div className={s.ai}>⏳ Ich denke…</div>}
        </div>

        <div className={s.input}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Frag mich etwas…"
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={send}>Senden</button>
        </div>
      </div>
    </div>
  );
}
