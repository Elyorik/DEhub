import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, set, onDisconnect } from "firebase/database";
import { app } from "../../firebase";
import s from "./visitorCounter.module.scss";

export default function VisitorCounter() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const db = getDatabase(app);
    const visitorsRef = ref(db, "visitors");
    const userRef = ref(db, `visitors/${Math.random().toString(36).slice(2, 10)}`);

    // при подключении создаём запись о пользователе
    set(userRef, true);

    // при отключении удаляем
    onDisconnect(userRef).remove();

    // слушаем общее количество
    const unsubscribe = onValue(visitorsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setCount(Object.keys(data).length);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className={s.counterContainer}>
      <h2 className={s.title}>
        Jetzt online: {" "}
        <span className={s.number}>{count}</span>
      </h2>
    </div>
  );
}
