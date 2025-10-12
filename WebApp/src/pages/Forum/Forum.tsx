import React, { useEffect, useState, useRef } from "react";
import styles from "./forum.module.scss";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

interface Message {
  id: string;
  text: string;
  userName: string;
  userId: string;
  createdAt: any;
}

const Forum = () => {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const [messages, setMessages] = useState<Message[]>([]);
  const [devMessages, setDevMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isDevPanelOpen, setDevPanelOpen] = useState(false);
  const [devUsersCount, setDevUsersCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Подписка на обычные сообщения
  useEffect(() => {
    const q = query(collection(db, "forumMessages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, "id">),
      }));
      setMessages(msgs);
      scrollToBottom();
    });
    return () => unsubscribe();
  }, []);

  // Подписка на dev-сообщения
  useEffect(() => {
    const q = query(collection(db, "devMessages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, "id">),
      }));
      setDevMessages(msgs);
    });
    return () => unsubscribe();
  }, []);

  // Подписка на онлайн пользователей
  useEffect(() => {
    const q = query(collection(db, "devOnline"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDevUsersCount(snapshot.docs.length);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Добавляем пользователя в online сразу при входе на сайт
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "devOnline", user.id);

    // Добавляем пользователя при входе
    setDoc(userRef, {
      userName: user.name,
      userId: user.id,
      lastActive: serverTimestamp(),
    });

    // Обновляем активность каждые 30 секунд
    const interval = setInterval(() => {
      setDoc(userRef, {
        userName: user.name,
        userId: user.id,
        lastActive: serverTimestamp(),
      });
    }, 30000);

    // Удаляем при закрытии вкладки
    const handleUnload = () => deleteDoc(userRef);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      deleteDoc(userRef);
    };
  }, [user]);

  // Прокрутка вниз
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Фокус (телефоны)
  useEffect(() => {
    const handleFocus = () => {
      setTimeout(() => {
        scrollToBottom();
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 200);
    };
    const input = inputRef.current;
    input?.addEventListener("focus", handleFocus);
    return () => input?.removeEventListener("focus", handleFocus);
  }, []);

  // Блокировка скролла
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  // Исправление поведения при открытии клавиатуры (мобильные)
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const viewport = window.visualViewport;
    const chatContainer = document.querySelector(`.${styles.forumContainer}`) as HTMLElement | null;

    const adjustForKeyboard = () => {
      const keyboardHeight = window.innerHeight - viewport.height;
      if (keyboardHeight > 150) {
        chatContainer!.style.paddingBottom = `${keyboardHeight - 50}px`;
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        chatContainer!.style.paddingBottom = "0px";
      }
    };

    viewport.addEventListener("resize", adjustForKeyboard);
    return () => viewport.removeEventListener("resize", adjustForKeyboard);
  }, []);

  // Отправка сообщений
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const text = newMessage.trim();
    try {
      if (text.startsWith("/dev")) {
        await addDoc(collection(db, "devMessages"), {
          text: text.replace("/dev", "").trim(),
          userName: user.name,
          userId: user.id,
          createdAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "forumMessages"), {
          text,
          userName: user.name,
          userId: user.id,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Ошибка при отправке:", err);
    }

    setNewMessage("");
    scrollToBottom();
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const groupedMessages = messages.reduce((groups: any, msg) => {
    const date = msg.createdAt?.toDate
      ? formatDate(msg.createdAt.toDate())
      : "Unbekannt";
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  if (!user) {
    return (
      <div className={styles.registerNotice}>
        <h2>🔒 Du musst dich registrieren, um das Forum zu betreten.</h2>
      </div>
    );
  }

  return (
    <div className={styles.forumContainer} style={{ marginTop: "56px" }}>
      {/* Основной чат */}
      <div className={styles.chatBox}>
        {Object.keys(groupedMessages).map((date) => (
          <React.Fragment key={date}>
            <div className={styles.dateDivider}>{date}</div>
            {groupedMessages[date].map((msg: Message) => (
              <div
                key={msg.id}
                className={`${styles.message} ${
                  msg.userId === user.id ? styles.myMessage : styles.otherMessage
                }`}
              >
                <div className={styles.messageHeader}>{msg.userName}</div>
                <div className={styles.messageText}>{msg.text}</div>
                <div className={styles.messageTime}>
                  {msg.createdAt?.toDate
                    ? msg.createdAt
                        .toDate()
                        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : ""}
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <form onSubmit={handleSend} className={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Schreibe etwas... (/dev für Entwickler)"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.sendButton}>
          Senden
        </button>
      </form>

      {/* Кнопка открытия Dev-панели + глобальный LIVE */}
      {!isDevPanelOpen && (
        <div className={styles.devButtonWrapper}>
          <button
            className={styles.devButton}
            onClick={() => setDevPanelOpen(true)}
          >
            !
          </button>
          <span className={styles.globalLive}>LIVE: {devUsersCount}</span>
        </div>
      )}

      {/* Панель разработчика */}
      {isDevPanelOpen && (
        <div className={styles.devPanel}>
          <div className={styles.devHeader}>
            <span>🟢 Developer Chat</span>
            <span className={styles.liveCount}>LIVE: {devUsersCount}</span>
            <button
              className={styles.closeDevPanel}
              onClick={() => setDevPanelOpen(false)}
            >
              ✖
            </button>
          </div>
          <div className={styles.devMessages}>
            {devMessages.map((msg) => (
              <div key={msg.id} className={styles.devMessage}>
                <strong>{msg.userName}</strong>: {msg.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;
