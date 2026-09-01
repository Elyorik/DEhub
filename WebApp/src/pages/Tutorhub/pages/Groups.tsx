import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { getTeacherProfile } from "../services/tutorhubTeachers";
import { getTutorhubUser } from "../services/tutorhubUsers";
import { createGroup, decideGroupRequest, deleteGroup, getGroupRequests, getGroups, requestGroupJoin, setGroupCallActive, type GroupJoinRequest, type TutorhubGroup } from "../services/tutorhubGroups";
import s from "./Groups.module.scss";
import TutorhubBackToDashboard from "../components/TutorhubBackToDashboard";

export default function Groups() {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const [params] = useSearchParams();
  const [role, setRole] = useState<"student" | "teacher" | null>(null);
  const [groups, setGroups] = useState<TutorhubGroup[]>([]);
  const [requests, setRequests] = useState<GroupJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const teacherFilter = params.get("teacher") || undefined;

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const appUser = await getTutorhubUser(user.id);
      const nextRole = appUser?.role === "teacher" ? "teacher" : appUser?.role === "student" ? "student" : null;
      setRole(nextRole);
      const ownerId = nextRole === "teacher" ? user.id : teacherFilter;
      const [nextGroups, nextRequests] = await Promise.all([getGroups(ownerId), nextRole ? getGroupRequests(nextRole === "teacher" ? user.id : undefined, nextRole === "student" ? user.id : undefined) : Promise.resolve([])]);
      setGroups(nextGroups); setRequests(nextRequests);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [user?.id, teacherFilter]);

  async function addGroup(event: FormEvent) {
    event.preventDefault(); if (!user || !name.trim() || !subject.trim()) return;
    const teacher = await getTeacherProfile(user.id); if (!teacher) return;
    await createGroup({ teacherId: user.id, teacherName: teacher.name, name: name.trim(), subject: subject.trim() });
    setName(""); setSubject(""); setMessage("Gruppe erstellt."); load();
  }
  const requestsByGroup = useMemo(() => new Map(requests.filter((item) => item.status === "pending").map((item) => [item.groupId, item])), [requests]);
  return <section className={s.page}><TutorhubBackToDashboard />
    <header><p>Gruppenunterricht</p><h1>{role === "teacher" ? "Meine Gruppen" : "Lerngruppen finden"}</h1><span>{role === "teacher" ? "Erstelle Fachgruppen, verwalte Anfragen und starte Unterricht." : "Wähle eine Gruppe und bitte den Lehrer um Freigabe."}</span></header>
    {message && <div className={s.message}>{message}</div>}
    {role === "teacher" && <form className={s.create} onSubmit={addGroup}><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Gruppenname, z. B. Mathe DSD 2" required /><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Fach, z. B. Mathematik" required /><button>Gruppe erstellen</button></form>}
    {loading ? <p>Lade Gruppen...</p> : groups.length === 0 ? <div className={s.empty}>{role === "teacher" ? "Erstelle deine erste Lerngruppe." : "Dieser Lehrer hat noch keine öffentlichen Gruppen."}</div> : <div className={s.grid}>{groups.map((group) => {
      const member = group.members.some((item) => item.uid === user?.id); const request = requests.find((item) => item.groupId === group.id);
      return <article key={group.id}><div className={s.top}><span>{group.subject}</span>{group.callActive && <b>Live</b>}</div><h2>{group.name}</h2><p>Lehrer: {group.teacherName}</p><p>{group.members.length} {group.members.length === 1 ? "Mitglied" : "Mitglieder"}</p>
        {role === "teacher" ? <><div className={s.members}>{group.members.map((item) => <span key={item.uid}>{item.name}</span>)}</div>{requestsByGroup.get(group.id) && <div className={s.request}><strong>{requestsByGroup.get(group.id)?.studentName} möchte beitreten</strong><button onClick={async () => { await decideGroupRequest(requestsByGroup.get(group.id)!, true); load(); }}>Annehmen</button><button onClick={async () => { await decideGroupRequest(requestsByGroup.get(group.id)!, false); load(); }}>Ablehnen</button></div>}<div className={s.actions}><button onClick={async () => { await setGroupCallActive(group.id, !group.callActive); load(); }}>{group.callActive ? "Call beenden" : "Call starten"}</button>{group.callActive && <Link to={`/Tutorhub/groups/${group.id}/call`}>Zum Call</Link>}<button className={s.delete} onClick={async () => { if (window.confirm("Gruppe wirklich löschen?")) { await deleteGroup(group.id); load(); } }}>Löschen</button></div></> : <>{member ? <div className={s.actions}>{group.callActive ? <Link className={s.join} to={`/Tutorhub/groups/${group.id}/call`}>Call beitreten</Link> : <span>Call noch nicht gestartet</span>}</div> : request ? <p className={s.pending}>Anfrage: {request.status === "pending" ? "wartet auf Freigabe" : request.status === "approved" ? "freigegeben – Seite neu laden" : "abgelehnt"}</p> : <button onClick={async () => { if (!user) return; await requestGroupJoin(group, user.id, user.name || "Schüler"); load(); }}>Beitritt anfragen</button>}</>}</article>;
    })}</div>}
  </section>;
}
