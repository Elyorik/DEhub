import { useState } from "react";
import s from "./ki.module.scss";

type Msg = {
  role: "user" | "ai";
  text: string;
};

export default function KI() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });

      const data = await res.json();

      setMessages((m) => [...m, { role: "ai", text: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "❌ Server nicht erreichbar" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.page}>
      <div className={s.chatBox}>
        <div className={s.messages}>
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
          />
          <button onClick={send}>{loading ? "…" : "Senden"}</button>
        </div>
      </div>
    </div>
  );
}
