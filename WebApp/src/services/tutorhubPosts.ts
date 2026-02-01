// src/services/tutorhubPosts.ts
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import type { UploadedMedia } from "../utils/cloudinaryUpload";

export interface TutorHubPostData {
  id: string;
  name: string;
  text: string;
  media: UploadedMedia[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  likes: string[];
  commentsCount: number;
  createdAt: number;
}

export interface UserWithPosts {
  userId: string;
  name: string;
  avatar: string;
  postCount: number;
  lastPostAt: number;
}

const POSTS_COLLECTION = "tutorhub_posts";
const USERS_COLLECTION = "tutorhub_users";

export async function createPost(data: {
  name: string;
  text: string;
  media: UploadedMedia[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
    ...data,
    likes: [],
    commentsCount: 0,
    createdAt: Date.now(),
  });

  // Update or create user profile
  await setDoc(doc(db, USERS_COLLECTION, data.authorId), {
    name: data.authorName,
    avatar: data.authorAvatar,
    updatedAt: Date.now(),
  }, { merge: true });

  return docRef.id;
}

export async function getPosts(): Promise<TutorHubPostData[]> {
  const snapshot = await getDocs(collection(db, POSTS_COLLECTION));

  const posts = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toMillis?.() || Date.now(),
  })) as TutorHubPostData[];

  // Sort by createdAt desc in memory
  return posts.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getPostsByUser(userId: string): Promise<TutorHubPostData[]> {
  const q = query(
    collection(db, POSTS_COLLECTION),
    where("authorId", "==", userId)
  );
  const snapshot = await getDocs(q);

  const posts = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toMillis?.() || Date.now(),
  })) as TutorHubPostData[];

  // Sort by createdAt desc in memory
  return posts.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getUsersWithPosts(): Promise<UserWithPosts[]> {
  // Get all posts grouped by author
  const snapshot = await getDocs(collection(db, POSTS_COLLECTION));
  
  const userMap = new Map<string, { name: string; avatar: string; lastPostAt: number; count: number }>();
  
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const authorId = data.authorId;
    const createdAt = data.createdAt?.toMillis?.() || Date.now();
    
    if (!userMap.has(authorId)) {
      userMap.set(authorId, {
        name: data.authorName || "Unknown",
        avatar: data.authorAvatar || "",
        lastPostAt: createdAt,
        count: 0,
      });
    }
    
    const user = userMap.get(authorId)!;
    user.count++;
    if (createdAt > user.lastPostAt) {
      user.lastPostAt = createdAt;
    }
  });

  return Array.from(userMap.entries()).map(([userId, user]): UserWithPosts => ({
    userId,
    name: user.name,
    avatar: user.avatar,
    postCount: user.count,
    lastPostAt: user.lastPostAt,
  })).sort((a, b) => b.lastPostAt - a.lastPostAt);
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(db, POSTS_COLLECTION, postId));
}

export async function updateUserProfile(userId: string, name: string, avatar: string): Promise<void> {
  console.log("updateUserProfile called with:", { userId, name, avatar });
  
  // First update the user profile document
  console.log("Updating user document...");
  await setDoc(doc(db, USERS_COLLECTION, userId), {
    name,
    avatar,
    updatedAt: Date.now(),
  }, { merge: true });
  console.log("User document updated successfully");

  // Then update all posts by this user
  try {
    const q = query(collection(db, POSTS_COLLECTION), where("authorId", "==", userId));
    const snapshot = await getDocs(q);
    console.log("Found", snapshot.docs.length, "posts to update");
    
    if (snapshot.docs.length > 0) {
      const batch = snapshot.docs.map((docSnap) => 
        updateDoc(doc(db, POSTS_COLLECTION, docSnap.id), {
          authorName: name,
          authorAvatar: avatar,
        })
      );
      
      await Promise.all(batch);
      console.log("All posts updated successfully");
    }
  } catch (postError) {
    console.error("Failed to update posts:", postError);
    // Don't throw - the user profile was still updated
  }
}

export async function getUserProfile(userId: string): Promise<{ name: string; avatar: string } | null> {
  const docSnap = await getDoc(doc(db, USERS_COLLECTION, userId));
  if (docSnap.exists()) {
    return docSnap.data() as { name: string; avatar: string };
  }
  return null;
}

// ============ LIKE FUNCTIONS ============

export interface LikeInfo {
  id: string; // userId_postId
  userId: string;
  postId: string;
  createdAt: number;
}

export async function toggleLike(userId: string, postId: string): Promise<boolean> {
  const likeId = `${userId}_${postId}`;
  const likeDoc = doc(db, "tutorhub_likes", likeId);
  const likeSnap = await getDoc(likeDoc);
  
  if (likeSnap.exists()) {
    // Unlike - just delete the like document
    await deleteDoc(likeDoc);
    return false; // Now unliked
  } else {
    // Like - just create the like document
    await setDoc(likeDoc, {
      userId,
      postId,
      createdAt: Date.now(),
    });
    return true; // Now liked
  }
}

export async function getPostLikes(postId: string): Promise<string[]> {
  const q = query(collection(db, "tutorhub_likes"), where("postId", "==", postId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data().userId);
}

export async function getPostLikesCount(postId: string): Promise<number> {
  const q = query(collection(db, "tutorhub_likes"), where("postId", "==", postId));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function checkUserLikedPost(userId: string, postId: string): Promise<boolean> {
  const likeId = `${userId}_${postId}`;
  const likeDoc = doc(db, "tutorhub_likes", likeId);
  const likeSnap = await getDoc(likeDoc);
  return likeSnap.exists();
}

// ============ COMMENT FUNCTIONS ============

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: number;
}

export async function addComment(data: {
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, "tutorhub_comments"), {
    ...data,
    createdAt: Date.now(),
  });
  
  // Update post comments count
  const postDoc = doc(db, POSTS_COLLECTION, data.postId);
  const postSnap = await getDoc(postDoc);
  if (postSnap.exists()) {
    const commentsCount: number = postSnap.data().commentsCount || 0;
    await updateDoc(postDoc, { commentsCount: commentsCount + 1 });
  }
  
  return docRef.id;
}

export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  const q = query(
    collection(db, "tutorhub_comments"),
    where("postId", "==", postId)
  );
  const snapshot = await getDocs(q);
  
  const comments: Comment[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Comment[];
  
  return comments.sort((a, b) => a.createdAt - b.createdAt);
}

export async function deleteComment(commentId: string, postId: string): Promise<void> {
  await deleteDoc(doc(db, "tutorhub_comments", commentId));
  
  // Update post comments count
  const postDoc = doc(db, POSTS_COLLECTION, postId);
  const postSnap = await getDoc(postDoc);
  if (postSnap.exists()) {
    const commentsCount: number = postSnap.data().commentsCount || 0;
    await updateDoc(postDoc, { commentsCount: Math.max(0, commentsCount - 1) });
  }
}
