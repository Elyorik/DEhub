import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";
import type { TeacherProfile } from "../models/tutorhubTeacher.model";

const TEACHERS_COLLECTION = "tutorhub_teacher_profiles";
const USERS_COLLECTION = "tutorhub_app_users";

export async function saveTeacherProfile(profile: TeacherProfile): Promise<void> {
  const now = Date.now();

  await setDoc(
    doc(db, TEACHERS_COLLECTION, profile.uid),
    {
      ...profile,
      status: profile.status || "pending",
      createdAt: profile.createdAt || now,
      updatedAt: now,
    },
    { merge: true }
  );

  await setDoc(
    doc(db, USERS_COLLECTION, profile.uid),
    {
      uid: profile.uid,
      role: "teacher",
      name: profile.name,
      email: profile.email,
      phone: profile.phone || "",
      avatar: profile.avatar || "",
      profileStatus: profile.status || "pending",
      updatedAt: now,
    },
    { merge: true }
  );
}

export async function getTeacherProfile(uid: string): Promise<TeacherProfile | null> {
  const snap = await getDoc(doc(db, TEACHERS_COLLECTION, uid));
  return snap.exists() ? (snap.data() as TeacherProfile) : null;
}

export async function getApprovedTeachers(): Promise<TeacherProfile[]> {
  const q = query(collection(db, TEACHERS_COLLECTION), where("status", "==", "approved"));
  const snap = await getDocs(q);
  return snap.docs.map((teacherDoc) => teacherDoc.data() as TeacherProfile);
}