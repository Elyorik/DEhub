import { useState } from "react";
import type { UploadedMedia } from "../../utils/cloudinaryUpload";
import s from "./PostMediaCarousel.module.scss";

interface Props {
  media: UploadedMedia[];
}

export default function PostMediaCarousel({ media }: Props) {
  const [index, setIndex] = useState(0);
  const item = media[index];

  const goToPrev = () => {
    setIndex((index - 1 + media.length) % media.length);
  };

  const goToNext = () => {
    setIndex((index + 1) % media.length);
  };

  if (!item) return null;

  return (
    <div className={s.carousel}>
      {item.type === "image" && <img src={item.url} alt={`Image ${index + 1}`} />}
      {item.type === "video" && <video src={item.url} controls />}
      {item.type === "file" && (
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          📄 Datei herunterladen
        </a>
      )}

      {media.length > 1 && (
        <>
          <button className={s.prev} onClick={goToPrev}>
            ‹
          </button>
          <button className={s.next} onClick={goToNext}>
            ›
          </button>
          <div className={s.pagination}>
            {media.map((_, i) => (
              <div
                key={i}
                className={`${s.dot} ${i === index ? s.active : ""}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
