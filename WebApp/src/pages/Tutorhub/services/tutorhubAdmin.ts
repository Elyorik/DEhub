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

export async function isTutorhubAdmin(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, ADMINS_COLLECTION, uid));
  return snap.exists();
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
      profileStatus: status,
      rejectionReason,
      updatedAt: now,
    },
    { merge: true }
  );
}