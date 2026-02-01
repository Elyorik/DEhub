import { useEffect } from "react";
import PostMediaCarousel from "./PostMediaCarousel";
import type { UploadedMedia } from "../../utils/cloudinaryUpload";
import s from "./PostFullscreen.module.scss";

interface PostFullscreenProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  text: string;
  media: UploadedMedia[];
  authorName: string;
  authorAvatar: string;
}

export default function PostFullscreen({
  isOpen,
  onClose,
  name,
  text,
  media,
  authorName,
  authorAvatar,
}: PostFullscreenProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={s.overlay} onClick={onClose}>
      <button className={s.closeButton} onClick={onClose}>
        ✕
      </button>

      <div className={s.container} onClick={(e) => e.stopPropagation()}>
        <div className={s.header}>
          <div className={s.author}>
            <div className={s.avatar}>
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} />
              ) : (
                <span>{authorName?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className={s.authorName}>{authorName}</span>
          </div>
          <h2 className={s.title}>{name}</h2>
        </div>

        {media?.length > 0 && (
          <div className={s.mediaContainer}>
            <PostMediaCarousel media={media} />
          </div>
        )}

        <div className={s.textContainer}>
          <p className={s.text}>{text}</p>
        </div>
      </div>
    </div>
  );
}
