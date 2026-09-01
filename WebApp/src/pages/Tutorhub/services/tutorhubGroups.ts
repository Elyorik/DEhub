import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../../../firebase";

const GROUPS = "tutorhub_groups";
const REQUESTS = "tutorhub_group_requests";

export interface TutorhubGroupMember { uid: string; name: string; }
export interface TutorhubGroup {
  id: string; teacherId: string; teacherName: string; name: string; subject: string;
  roomName: string; callActive: boolean; members: TutorhubGroupMember[];
}
export interface GroupJoinRequest { id: string; groupId: string; teacherId: string; studentId: string; studentName: string; status: "pending" | "approved" | "rejected"; }

function mapGroup(id: string, data: Record<string, unknown>): TutorhubGroup {
  return { id, ...(data as Omit<TutorhubGroup, "id">), members: (data.members as TutorhubGroupMember[] | undefined) || [], callActive: Boolean(data.callActive) };
}

export async function getGroups(teacherId?: string): Promise<TutorhubGroup[]> {
  const groupQuery = teacherId ? query(collection(db, GROUPS), where("teacherId", "==", teacherId)) : collection(db, GROUPS);
  const snapshot = await getDocs(groupQuery);
  return snapshot.docs.map((item) => mapGroup(item.id, item.data())).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getGroup(id: string) {
  const snapshot = await getDoc(doc(db, GROUPS, id));
  return snapshot.exists() ? mapGroup(snapshot.id, snapshot.data()) : null;
}

export async function createGroup(data: Omit<TutorhubGroup, "id" | "members" | "callActive" | "roomName">) {
  const roomName = `DEhub-${data.teacherId.slice(0, 8)}-${Date.now().toString(36)}`;
  await addDoc(collection(db, GROUPS), { ...data, roomName, members: [], callActive: false, createdAt: serverTimestamp() });
}

export async function setGroupCallActive(id: string, callActive: boolean) { await updateDoc(doc(db, GROUPS, id), { callActive, updatedAt: serverTimestamp() }); }
export async function deleteGroup(id: string) { await deleteDoc(doc(db, GROUPS, id)); }

export async function requestGroupJoin(group: TutorhubGroup, studentId: string, studentName: string) {
  await addDoc(collection(db, REQUESTS), { groupId: group.id, teacherId: group.teacherId, studentId, studentName, status: "pending", createdAt: serverTimestamp() });
}

export async function getGroupRequests(teacherId?: string, studentId?: string): Promise<GroupJoinRequest[]> {
  const requestsQuery = teacherId ? query(collection(db, REQUESTS), where("teacherId", "==", teacherId)) : query(collection(db, REQUESTS), where("studentId", "==", studentId));
  const snapshot = await getDocs(requestsQuery);
  return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<GroupJoinRequest, "id">) }));
}

export async function decideGroupRequest(request: GroupJoinRequest, approved: boolean) {
  await updateDoc(doc(db, REQUESTS, request.id), { status: approved ? "approved" : "rejected", decidedAt: serverTimestamp() });
  if (!approved) return;
  const group = await getGroup(request.groupId);
  if (!group || group.members.some((member) => member.uid === request.studentId)) return;
  await updateDoc(doc(db, GROUPS, request.groupId), { members: [...group.members, { uid: request.studentId, name: request.studentName }], updatedAt: serverTimestamp() });
}
