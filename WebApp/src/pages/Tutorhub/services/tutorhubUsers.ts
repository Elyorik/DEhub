import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import type {
  StudentProfile,
  TutorhubRole,
  TutorhubUserProfile,
} from "../models/tutorhubUser.model";

const USERS_COLLECTION = "tutorhub_app_users";
const STUDENTS_COLLECTION = "tutorhub_student_profiles";

export async function getTutorhubUser(uid: string): Promise<TutorhubUserProfile | null> {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  return snap.exists() ? (snap.data() as TutorhubUserProfile) : null;
}

export async function createOrUpdateTutorhubUser(data: {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  role: TutorhubRole;
}): Promise<void> {
  const existing = await getTutorhubUser(data.uid);
  const now = Date.now();

  await setDoc(
    doc(db, USERS_COLLECTION, data.uid),
    {
      ...existing,
      ...data,
      profileStatus: existing?.profileStatus || "missing",
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    },
    { merge: true }
  );
}

export async function saveStudentProfile(profile: StudentProfile): Promise<void> {
  const now = Date.now();

  await setDoc(
    doc(db, STUDENTS_COLLECTION, profile.uid),
    {
      ...profile,
      profileStatus: "pending",
      rejectionReason: "",
      createdAt: profile.createdAt || now,
      updatedAt: now,
    },
    { merge: true }
  );

  await setDoc(
    doc(db, USERS_COLLECTION, profile.uid),
    {
      uid: profile.uid,
      role: "student",
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      profileStatus: "pending",
      rejectionReason: "",
      updatedAt: now,
    },
    { merge: true }
  );
}

export async function getStudentProfile(uid: string): Promise<StudentProfile | null> {
  const snap = await getDoc(doc(db, STUDENTS_COLLECTION, uid));
  return snap.exists() ? (snap.data() as StudentProfile) : null;
}