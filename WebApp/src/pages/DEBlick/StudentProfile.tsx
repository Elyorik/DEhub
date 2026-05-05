import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";

interface TutorPost {
  id: string;
  title: string;
  text: string;
}

export default function StudentProfile() {
  const { id } = useParams();
  const [posts, setPosts] = useState<TutorPost[]>([]);

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, "DEBlick_posts"), where("author.id", "==", id));
    return onSnapshot(q, (snap) => {
      setPosts(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as TutorPost[]
      );
    });
  }, [id]);

  return (
    <div className="page">
      <h2>Beiträge</h2>
      {posts.map((p) => (
        <div key={p.id}>
          <h4>{p.title}</h4>
          <p>{p.text}</p>
        </div>
      ))}
    </div>
  );
}
