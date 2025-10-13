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
    // Jede Sitzung bekommt eine zufällige ID
    const id = Math.random().toString(36).substring(2, 10);
    const userRef = doc(db, "visitors", id);

    // Benutzer als "online" markieren
    setDoc(userRef, {
      active: true,
      lastSeen: serverTimestamp(),
    });

    // Wenn Benutzer die Seite verlässt, löschen
    const cleanup = () => deleteDoc(userRef);
    window.addEventListener("beforeunload", cleanup);

    // Echtzeit-Listener auf alle Besucher
    const unsub = onSnapshot(collection(db, "visitors"), (snapshot) => {
      setCount(snapshot.size);
    });

    return () => {
      unsub();
      cleanup();
      window.removeEventListener("beforeunload", cleanup);
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
