// components/VisitorsCounter/VisitorTracker.tsx
import { useEffect } from "react";
import { db } from "../../firebase";
import { doc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";

export default function VisitorTracker() {
  useEffect(() => {
    // 🆔 уникальный ID для каждого устройства
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = Math.random().toString(36).substring(2, 10);
      localStorage.setItem("device_id", id);
    }

    const userRef = doc(db, "visitors", id);

    // 🔹 отмечаем пользователя как активного
    const setOnline = async () => {
      await setDoc(userRef, {
        active: true,
        lastSeen: Date.now(),
      });
    };

    setOnline();

    // 🔄 каждые 10 сек обновляем активность
    const pingInterval = setInterval(setOnline, 10000);

    // 🧹 удаляем при закрытии вкладки
    const cleanup = () => {
      const url = `https://firestore.googleapis.com/v1/projects/dehub-349de/databases/(default)/documents/visitors/${id}`;
      navigator.sendBeacon(url, JSON.stringify({ delete: true }));
    };
    window.addEventListener("unload", cleanup);

    // 🔥 каждые 10 сек проверяем, сколько сейчас активных
    const checkActive = async () => {
      const snapshot = await getDocs(collection(db, "visitors"));
      const now = Date.now();
      let activeCount = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.lastSeen && now - data.lastSeen > 15000) {
          await deleteDoc(doc(db, "visitors", docSnap.id)); // очистка старых
        } else {
          activeCount++;
        }
      }

      // 🧠 сохраняем количество в localStorage как JSON
      localStorage.setItem("onlineCount", JSON.stringify({ value: activeCount, updated: now }));
    };

    // запускаем сразу и повторяем каждые 10 сек
    checkActive();
    const checkInterval = setInterval(checkActive, 10000);

    return () => {
      clearInterval(pingInterval);
      clearInterval(checkInterval);
      window.removeEventListener("unload", cleanup);
      cleanup();
    };
  }, []);

  return null; // ничего не показываем
}
