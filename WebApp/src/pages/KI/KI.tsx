import { useState } from "react";
import s from "./ki.module.scss";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function KI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const data: { answer?: string } = await res.json();

      const aiMessage: Message = {
        role: "assistant",
        content: data.answer ?? "❌ Keine Antwort",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Server nicht erreichbar" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <h1 className={s.title}>🤖 DEhub KI</h1>

      <div className={s.chat}>
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? s.user : s.ai}>
            {m.content}
          </div>
        ))}
        {loading && <div className={s.ai}>💭 KI denkt…</div>}
      </div>

      <div className={s.inputBox}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Frag mich etwas…"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Senden</button>
      </div>
    </div>
  );
}
