import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";
import type { TeacherProfile, TeacherStatus } from "../models/tutorhubTeacher.model";
import type { StudentProfile, TutorhubProfileStatus } from "../models/tutorhubUser.model";

const ADMINS_COLLECTION = "tutorhub_admins";
const USERS_COLLECTION = "tutorhub_app_users";
const STUDENTS_COLLECTION = "tutorhub_student_profiles";
const TEACHERS_COLLECTION = "tutorhub_teacher_profiles";

export type AdminProfileStatus = "all" | "pending" | "approved" | "rejected";

export async function isTutorhubAdmin(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, ADMINS_COLLECTION, uid));
  return snap.exists();
}

export async function getAllStudents(): Promise<StudentProfile[]> {
  const snap = await getDocs(collection(db, STUDENTS_COLLECTION));

  return snap.docs
    .map((studentDoc) => studentDoc.data() as StudentProfile)
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
}

export async function getAllTeachers(): Promise<TeacherProfile[]> {
  const snap = await getDocs(collection(db, TEACHERS_COLLECTION));

  return snap.docs
    .map((teacherDoc) => teacherDoc.data() as TeacherProfile)
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
}

export async function getPendingStudents(): Promise<StudentProfile[]> {
  const q = query(
    collection(db, STUDENTS_COLLECTION),
    where("profileStatus", "==", "pending")
  );
  const snap = await getDocs(q);
  return snap.docs.map((studentDoc) => studentDoc.data() as StudentProfile);
}

export async function getPendingTeachers(): Promise<TeacherProfile[]> {
  const q = query(
    collection(db, TEACHERS_COLLECTION),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  return snap.docs.map((teacherDoc) => teacherDoc.data() as TeacherProfile);
}

export async function updateStudentApproval(
  uid: string,
  status: TutorhubProfileStatus,
  rejectionReason = ""
): Promise<void> {
  const now = Date.now();

  await updateDoc(doc(db, STUDENTS_COLLECTION, uid), {
    profileStatus: status,
    rejectionReason,
    updatedAt: now,
  });

  await setDoc(
    doc(db, USERS_COLLECTION, uid),
    {
      role: "student",
      profileStatus: status,
      rejectionReason,
      updatedAt: now,
    },
    { merge: true }
  );
}

export async function updateTeacherApproval(
  uid: string,
  status: TeacherStatus,
  rejectionReason = ""
): Promise<void> {
  const now = Date.now();

  await updateDoc(doc(db, TEACHERS_COLLECTION, uid), {
    status,
    rejectionReason,
    updatedAt: now,
  });

  await setDoc(
    doc(db, USERS_COLLECTION, uid),
    {
      role: "teacher",
      profileStatus: status,
      rejectionReason,
      updatedAt: now,
    },
    { merge: true }
  );
}