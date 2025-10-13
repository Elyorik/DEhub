import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import s from "./visitorCounter.module.scss";

export default function VisitorCounter() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // 📌 1. Получаем постоянный ID из localStorage
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = Math.random().toString(36).substring(2, 10);
      localStorage.setItem("device_id", id);
    }

    const userRef = doc(db, "visitors", id);

    // 📌 2. Отмечаем устройство как онлайн
    const setOnline = async () => {
      await setDoc(userRef, {
        active: true,
        lastSeen: serverTimestamp(),
      });
    };

    setOnline();

    // 📌 3. Каждые 30 секунд обновляем время активности
    const interval = setInterval(setOnline, 30000);

    // 📌 4. Удаляем при закрытии страницы
    const cleanup = async () => {
      await deleteDoc(userRef);
    };
    window.addEventListener("beforeunload", cleanup);

    // 📌 5. Слушаем изменения
    const unsub = onSnapshot(collection(db, "visitors"), (snapshot) => {
      setCount(snapshot.size);
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
