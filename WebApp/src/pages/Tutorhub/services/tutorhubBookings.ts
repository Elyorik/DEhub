import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";

export type BookingStatus = "pending" | "paid" | "cancelled" | "completed";

export interface TutorhubBooking {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  lessonType: "individual" | "group";
  credits: number;
  status: BookingStatus;
  createdAt: number;
}

const BOOKINGS_COLLECTION = "tutorhub_bookings";

export async function createTutorhubBooking(
  booking: Omit<TutorhubBooking, "id" | "createdAt" | "status">
): Promise<string> {
  const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
    ...booking,
    status: "pending",
    createdAt: Date.now(),
  });

  return docRef.id;
}

export async function getStudentBookings(studentId: string): Promise<TutorhubBooking[]> {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where("studentId", "==", studentId)
  );

  const snap = await getDocs(q);

  return snap.docs
    .map((bookingDoc) => ({
      id: bookingDoc.id,
      ...bookingDoc.data(),
    }) as TutorhubBooking)
    .sort((a, b) => b.createdAt - a.createdAt);
}