import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "paid"
  | "cancelled"
  | "completed";

export interface TutorhubBooking {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  lessonType: "individual" | "group";
  credits: number;
  status: BookingStatus;
  message?: string;
  rejectionReason?: string;
  meetingLink?: string;
  createdAt: number;
  updatedAt: number;
}

const BOOKINGS_COLLECTION = "tutorhub_bookings";

function mapBooking(id: string, data: Record<string, unknown>): TutorhubBooking {
  return {
    id,
    ...(data as Omit<TutorhubBooking, "id">),
  };
}

function sortBookings(bookings: TutorhubBooking[]) {
  return bookings.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
}

export async function createTutorhubBooking(
  booking: Omit<TutorhubBooking, "id" | "createdAt" | "updatedAt" | "status">
): Promise<string> {
  const now = Date.now();

  const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
    ...booking,
    status: "pending",
    rejectionReason: "",
    meetingLink: "",
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

export async function getStudentBookings(studentId: string): Promise<TutorhubBooking[]> {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where("studentId", "==", studentId)
  );

  const snap = await getDocs(q);

  return sortBookings(
    snap.docs.map((bookingDoc) => mapBooking(bookingDoc.id, bookingDoc.data()))
  );
}

export async function getTeacherBookings(teacherId: string): Promise<TutorhubBooking[]> {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where("teacherId", "==", teacherId)
  );

  const snap = await getDocs(q);

  return sortBookings(
    snap.docs.map((bookingDoc) => mapBooking(bookingDoc.id, bookingDoc.data()))
  );
}

export async function acceptTutorhubBooking(bookingId: string): Promise<void> {
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
    status: "accepted",
    rejectionReason: "",
    meetingLink: `https://meet.jit.si/DEhub-Unterricht-${bookingId}`,
    updatedAt: Date.now(),
  });
}

export async function rejectTutorhubBooking(
  bookingId: string,
  rejectionReason: string
): Promise<void> {
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
    status: "rejected",
    rejectionReason,
    updatedAt: Date.now(),
  });
}

export async function cancelTutorhubBooking(bookingId: string): Promise<void> {
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
    status: "cancelled",
    updatedAt: Date.now(),
  });
}

export async function completeTutorhubBooking(bookingId: string): Promise<void> {
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
    status: "completed",
    updatedAt: Date.now(),
  });
}

export async function setTutorhubBookingMeetingLink(
  bookingId: string,
  meetingLink: string
): Promise<void> {
  await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), {
    meetingLink,
    updatedAt: Date.now(),
  });
}
