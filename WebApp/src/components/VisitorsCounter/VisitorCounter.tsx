import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import s from "./visitorCounter.module.scss";

export default function VisitorCounter() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // 📌 1. Уникальный ID устройства (фиксируется в localStorage)
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = Math.random().toString(36).substring(2, 10);
      localStorage.setItem("device_id", id);
    }

    const userRef = doc(db, "visitors", id);

    // 📌 2. Помечаем как активного
    const setOnline = async () => {
      await setDoc(userRef, {
        active: true,
        lastSeen: Date.now(),
      });
    };

    setOnline();

    // ⏰ Каждые 30 сек обновляем "lastSeen"
    const interval = setInterval(setOnline, 30000);

    // 📉 Удаляем при закрытии страницы
    const cleanup = async () => {
      await deleteDoc(userRef);
    };
    window.addEventListener("beforeunload", cleanup);

    // 👀 Подписываемся на обновления
    const unsub = onSnapshot(collection(db, "visitors"), async (snapshot) => {
      const now = Date.now();
      let activeCount = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        // если не обновлялся более 60 сек → удаляем
        if (data.lastSeen && now - data.lastSeen > 60000) {
          await deleteDoc(doc(db, "visitors", docSnap.id));
        } else {
          activeCount++;
        }
      }

      setCount(activeCount);
    });

    return () => {
      clearInterval(interval);
      unsub();
      window.removeEventListener("beforeunload", cleanup);
      cleanup();
    };
  }, []);

  return (
    <div className={s.counterContainer}>
      <h2 className={s.title}>
        Jetzt online: <span className={s.number}>{count}</span>
      </h2>
    </div>
  );
}
