import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

const CALENDAR_EVENTS = "calendar_events";

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type?: CalendarEventType;
}

export type CalendarEventType = "exam" | "event" | "deadline";

export function subscribeToCalendarEvents(onChange: (events: CalendarEvent[]) => void) {
  const eventsQuery = query(collection(db, CALENDAR_EVENTS), orderBy("date", "asc"));
  return onSnapshot(eventsQuery, (snapshot) => {
    onChange(snapshot.docs.map((event) => ({ id: event.id, ...(event.data() as Omit<CalendarEvent, "id">) })));
  });
}

export async function createCalendarEvent(date: string, title: string, type: CalendarEventType) {
  await addDoc(collection(db, CALENDAR_EVENTS), { date, title, type, createdAt: Timestamp.now() });
}

export async function removeCalendarEvent(id: string) {
  await deleteDoc(doc(db, CALENDAR_EVENTS, id));
}

// Accepts an admin command such as: "22.09.2026 Exam for DSD2".
export function parseCalendarCommand(command: string): { date: string; title: string } | null {
  const match = command.trim().match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})\s+(.+)$/);
  if (!match) return null;

  const [, dayText, monthText, year, title] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const validationDate = new Date(Number(year), month - 1, day);
  if (validationDate.getFullYear() !== Number(year) || validationDate.getMonth() !== month - 1 || validationDate.getDate() !== day) return null;

  return { date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, title: title.trim() };
}
