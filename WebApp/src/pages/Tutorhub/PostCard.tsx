import s from "./Tutorhub.module.scss";
import type { TutorPost } from "./Tutorhub";

export default function PostCard({ post }: { post: TutorPost }) {
  return (
    <div className={s.post}>
      <div className={s.postHeader}>
        <div className={s.avatarSmall}></div>
        <strong>{post.author.name}</strong>
      </div>

      {post.images?.map((img, i) => (
        <img key={i} src={img} className={s.postImage} />
      ))}

      <div className={s.postContent}>
        <h4>{post.title}</h4>
        <p>{post.text}</p>
      </div>
    </div>
  );
}
