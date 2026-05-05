import { useState, useEffect } from "react";
import type { User } from "../../models/user.model";
import { 
  toggleLike, 
  checkUserLikedPost, 
  getCommentsByPost, 
  addComment, 
  getPostLikesCount,
  type Comment 
} from "../../services/tutorhubPosts";
import s from "./PostActions.module.scss";

interface PostActionsProps {
  postId: string;
  user: User | null;
  likes: string[];
  commentsCount: number;
  onRefresh?: () => void;
}

export default function PostActions({ postId, user, likes, commentsCount, onRefresh }: PostActionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if user already liked this post and get like count
  useEffect(() => {
    if (user) {
      checkUserLikedPost(user.id, postId).then(setIsLiked);
    }
    getPostLikesCount(postId).then(setLikeCount);
  }, [postId, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert("Sie müssen angemeldet sein, um zu liken");
      return;
    }

    try {
      const newIsLiked = await toggleLike(user.id, postId);
      setIsLiked(newIsLiked);
      // Refresh like count
      const newCount = await getPostLikesCount(postId);
      setLikeCount(newCount);
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleLoadComments = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showComments) {
      setShowComments(false);
      return;
    }

    setLoading(true);
    try {
      const fetchedComments = await getCommentsByPost(postId);
      setComments(fetchedComments);
      setShowComments(true);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      alert("Sie müssen angemeldet sein, um zu kommentieren");
      return;
    }

    if (!commentText.trim()) return;

    try {
      await addComment({
        postId,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar || "",
        text: commentText.trim(),
      });
      setCommentText("");
      // Refresh comments
      const fetchedComments = await getCommentsByPost(postId);
      setComments(fetchedComments);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Failed to add comment:", error);
      alert("Fehler beim Hinzufügen des Kommentars");
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/DEBlick/post/${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "DEBlick Post",
          text: "Schauen Sie sich diesen Beitrag an!",
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error
        console.log("Share cancelled");
      }
    } else {
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link in die Zwischenablage kopiert!");
      } catch (error) {
        console.error("Failed to copy:", error);
        prompt("Kopieren Sie diesen Link:", shareUrl);
      }
    }
  };

  return (
    <div className={s.container}>
      <div className={s.actions}>
        <button
          className={`${s.actionButton} ${isLiked ? s.liked : ""}`}
          onClick={handleLike}
        >
          <span className={s.icon}>{isLiked ? "❤️" : "🤍"}</span>
          <span>{likeCount}</span>
        </button>

        <button className={s.actionButton} onClick={handleLoadComments}>
          <span className={s.icon}>💬</span>
          <span>{commentsCount}</span>
        </button>

        <button className={s.actionButton} onClick={handleShare}>
          <span className={s.icon}>📤</span>
        </button>
      </div>

      {showComments && (
        <div className={s.commentsSection}>
          {loading ? (
            <p className={s.loading}>Laden...</p>
          ) : (
            <>
              {comments.length > 0 ? (
                <div className={s.commentsList}>
                  {comments.map((comment) => (
                    <div key={comment.id} className={s.comment}>
                      <div className={s.commentAuthor}>
                        <span className={s.commentName}>{comment.authorName}</span>
                        <span className={s.commentTime}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={s.commentText}>{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={s.noComments}>Noch keine Kommentare</p>
              )}

              {user && (
                <div className={s.addComment} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    placeholder="Kommentar schreiben..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  />
                  <button onClick={handleAddComment} disabled={!commentText.trim()}>
                    Posten
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
