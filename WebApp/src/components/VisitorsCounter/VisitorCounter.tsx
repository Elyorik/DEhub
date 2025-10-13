import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import s from "./visitorCounter.module.scss";

export default function VisitorCounter() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // 🔹 1. Уникальный ID устройства (фиксируется в localStorage)
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = Math.random().toString(36).substring(2, 10);
      localStorage.setItem("device_id", id);
    }

    const userRef = doc(db, "visitors", id);

    // 🔹 2. Помечаем как активного
    const setOnline = async () => {
      await setDoc(userRef, {
        active: true,
        lastSeen: Date.now(),
      });
    };

    setOnline();

    // 🔄 обновляем активность каждые 10 сек
    const interval = setInterval(setOnline, 10000);

    // 🔹 3. Удаляем при закрытии страницы (через sendBeacon)
    const cleanup = () => {
      const url = `https://firestore.googleapis.com/v1/projects/dehub-349de/databases/(default)/documents/visitors/${id}`;
      navigator.sendBeacon(url, JSON.stringify({ delete: true }));
    };
    window.addEventListener("unload", cleanup);

    // 🔹 4. Слушаем активных пользователей
    const unsub = onSnapshot(collection(db, "visitors"), async (snapshot) => {
      const now = Date.now();
      let activeCount = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // если неактивен более 15 секунд → удаляем
        if (data.lastSeen && now - data.lastSeen > 15000) {
          await deleteDoc(doc(db, "visitors", docSnap.id));
        } else {
          activeCount++;
        }
      }

      setCount(activeCount);
    });

    // 🧹 Очистка
    return () => {
      clearInterval(interval);
      unsub();
      window.removeEventListener("unload", cleanup);
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
