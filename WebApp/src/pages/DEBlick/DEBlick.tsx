import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import CreatePostModal from "./CreatePostModal";
import PostMediaCarousel from "./PostMediaCarousel";
import PostFullscreen from "./PostFullscreen";
import PostActions from "./PostActions";
import { 
  getPosts, 
  createPost as savePostToFirestore, 
  deletePost,
  getUsersWithPosts,
  getPostsByUser,
  updateUserProfile,
  type TutorHubPostData,
  type UserWithPosts 
} from "../../services/tutorhubPosts";
import type { UploadedMedia } from "../../utils/cloudinaryUpload";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import s from "./DEBlick.module.scss";

type Post = {
  id: string;
  name: string;
  text: string;
  media: UploadedMedia[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  likes: string[];
  commentsCount: number;
};

export default function DEBlick() {
  const reduxUser = useSelector((state: RootState) => state.user.currentUser);
  const navigate = useNavigate();
  const { userId } = useParams();
  
  // Use Redux user or UserContext user
  const user = reduxUser;
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [usersWithPosts, setUsersWithPosts] = useState<UserWithPosts[]>([]);
  const [selectedUserPosts, setSelectedUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [openMenuForPost, setOpenMenuForPost] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [fullscreenPost, setFullscreenPost] = useState<Post | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenuForPost && !(e.target as Element).closest(`.${s.menuButton}`) && !(e.target as Element).closest(`.${s.dropdown}`)) {
        setOpenMenuForPost(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuForPost]);

  // Load users with posts and all posts on mount
  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, allPosts] = await Promise.all([
        getUsersWithPosts(),
        getPosts()
      ]);
      
      setUsersWithPosts(usersData);
      
      if (userId) {
        // Show posts for specific user
        const userPosts = await getPostsByUser(userId);
        setSelectedUserPosts(userPosts.map(p => ({
          id: p.id,
          name: p.name,
          text: p.text,
          media: p.media,
          authorId: p.authorId,
          authorName: p.authorName,
          authorAvatar: p.authorAvatar,
          likes: p.likes || [],
          commentsCount: p.commentsCount || 0,
        })));
      } else {
        // Show all posts in feed
        setPosts(allPosts.map(p => ({
          id: p.id,
          name: p.name,
          text: p.text,
          media: p.media,
          authorId: p.authorId,
          authorName: p.authorName,
          authorAvatar: p.authorAvatar,
          likes: p.likes || [],
          commentsCount: p.commentsCount || 0,
        })));
        setSelectedUserPosts([]);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData: {
    name: string;
    text: string;
    media: UploadedMedia[];
  }) => {
    if (!user) {
      alert("Sie müssen angemeldet sein, um einen Beitrag zu erstellen");
      return;
    }

    try {
      await savePostToFirestore({
        name: postData.name,
        text: postData.text,
        media: postData.media,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar || "",
      });
      await loadData();
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to create post:", error);
      alert("Fehler beim Erstellen des Beitrags: " + (error?.message || error));
    }
  };

  const handleDeletePost = async (postId: string, postAuthorId: string) => {
    if (!user) {
      alert("Sie müssen angemeldet sein, um einen Beitrag zu löschen");
      return;
    }
    
    if (!confirm("Sind Sie sicher, dass Sie diesen Beitrag löschen möchten?")) return;

    try {
      await deletePost(postId);
      await loadData();
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Fehler beim Löschen des Beitrags");
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) {
      alert("Sie müssen angemeldet sein");
      return;
    }

    console.log("Updating profile:", { userId: user?.id, name: editName, avatar: editAvatar });
    console.log("Full user object:", user);

    try {
      await updateUserProfile(user.id, editName, editAvatar);
      setEditingProfile(false);
      await loadData();
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      alert("Fehler beim Aktualisieren des Profils: " + (error?.message || error));
    }
  };

  const startEditingProfile = () => {
    if (!user) return;
    setEditName(user.name);
    setEditAvatar(user.avatar || "");
    setEditingProfile(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const result = await uploadToCloudinary(file);
      setEditAvatar(result.url);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      alert("Fehler beim Hochladen des Avatars");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const displayedPosts = userId ? selectedUserPosts : posts;

  return (
    <div className={s.container}>
      <h2 className={s.title}>DEBlick</h2>

      {/* Users Section (like Instagram stories) */}
      {!userId && usersWithPosts.length > 0 && (
        <div className={s.usersSection}>
          <div className={s.usersScroll}>
            {/* Current user profile button */}
            {user && (
              <div 
                className={s.userStory} 
                onClick={() => {
                  if (user) {
                    setEditName(user.name);
                    setEditAvatar(user.avatar || "");
                    setEditingProfile(true);
                  }
                }}
              >
                <div className={`${s.avatar} ${s.avatarEditable}`}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user?.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span>Ihr Profil</span>
              </div>
            )}

            {/* Other users */}
            {usersWithPosts
              .filter(u => user ? u.userId !== user.id : true)
              .map((u) => (
                <div 
                  key={u.userId} 
                  className={s.userStory}
                  onClick={() => navigate(`/DEBlick/user/${u.userId}`)}
                >
                  <div className={s.avatar}>
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} />
                    ) : (
                      <span>{u.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span>{u.name}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* User Profile Header */}
      {userId && (
        <div className={s.profileHeader}>
          <div className={s.profileAvatar}>
            {selectedUserPosts[0]?.authorAvatar ? (
              <img src={selectedUserPosts[0].authorAvatar} alt="Avatar" />
            ) : (
              <span>{selectedUserPosts[0]?.authorName?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h3>{selectedUserPosts[0]?.authorName || "Benutzer"}</h3>
          <p>{selectedUserPosts.length} Beiträge</p>
          <button onClick={() => navigate("/DEBlick")} className={s.backButton}>
            ← Zurück zum Feed
          </button>
        </div>
      )}

      {/* Posts Feed */}
      {loading ? (
        <p className={s.loading}>Laden...</p>
      ) : displayedPosts.length === 0 ? (
        <p className={s.empty}>Es gibt noch keine Beiträge. Seien Sie der Erste!</p>
      ) : (
        <div className={s.feed}>
          {displayedPosts.map((post) => (
            <div 
              key={post.id} 
              className={s.postCard}
              onClick={() => setFullscreenPost(post)}
            >
              {/* Post Header */}
              <div className={s.postHeader}>
                <div 
                  className={s.postAuthor}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/DEBlick/user/${post.authorId}`);
                  }}
                >
                  <div className={s.avatar}>
                    {post.authorAvatar ? (
                      <img src={post.authorAvatar} alt={post.authorName} />
                    ) : (
                      <span>{post.authorName?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className={s.authorName}>{post.authorName}</span>
                </div>
                {user && user.id === post.authorId && (
                  <div className={s.postActions}>
                    <button
                      className={s.menuButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuForPost(openMenuForPost === post.id ? null : post.id);
                      }}
                    >
                      •••
                    </button>
                    {openMenuForPost === post.id && (
                      <div className={s.dropdown}>
                        <button
                          onClick={() => {
                            handleDeletePost(post.id, post.authorId);
                            setOpenMenuForPost(null);
                          }}
                        >
                          🗑 Löschen
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Post Title */}
              <h3 className={s.postTitle}>{post.name}</h3>

              {/* Post Media */}
              {post.media?.length > 0 && (
                <PostMediaCarousel media={post.media} />
              )}

              {/* Post Text */}
              <p className={s.postText}>{post.text}</p>

              {/* Actions: Like, Comment, Share */}
              <PostActions
                postId={post.id}
                user={user}
                likes={post.likes || []}
                commentsCount={post.commentsCount || 0}
                onRefresh={loadData}
              />
            </div>
          ))}
        </div>
      )}

      {/* Floating + Button */}
      {user && !userId && (
        <button className={s.addButton} onClick={() => setOpen(true)}>
          +
        </button>
      )}

      {/* Create Post Modal */}
      {open && (
        <CreatePostModal
          onClose={() => setOpen(false)}
          onCreated={handleCreatePost}
        />
      )}

      {/* Edit Profile Modal */}
      {editingProfile && user && (
        <div className={s.modalOverlay}>
          <div className={s.modal}>
            <h3>Profil bearbeiten</h3>
            
            {/* Avatar Upload */}
            <div className={s.avatarUploadSection}>
              <div className={s.avatarPreviewLarge}>
                {editAvatar ? (
                  <img src={editAvatar} alt="Avatar Preview" />
                ) : (
                  <div className={s.avatarPlaceholder}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label className={s.uploadButton}>
                {uploadingAvatar ? "Wird hochgeladen..." : "Foto vom Computer auswählen"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  hidden
                />
              </label>
            </div>

            {/* Name Input */}
            <input
              type="text"
              placeholder="Ihr Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            
            {/* Avatar URL (optional, as backup) */}
            <input
              type="text"
              placeholder="Oder Avatar-URL eingeben"
              value={editAvatar}
              onChange={(e) => setEditAvatar(e.target.value)}
            />

            <div className={s.modalButtons}>
              <button onClick={() => setEditingProfile(false)}>Abbrechen</button>
              <button onClick={handleUpdateProfile}>Speichern</button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Post View */}
      {fullscreenPost && (
        <PostFullscreen
          isOpen={true}
          onClose={() => setFullscreenPost(null)}
          name={fullscreenPost.name}
          text={fullscreenPost.text}
          media={fullscreenPost.media}
          authorName={fullscreenPost.authorName}
          authorAvatar={fullscreenPost.authorAvatar}
        />
      )}
    </div>
  );
}
