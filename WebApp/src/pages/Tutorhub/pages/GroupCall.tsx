import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { getGroup, type TutorhubGroup } from "../services/tutorhubGroups";
import s from "./GroupCall.module.scss";

export default function GroupCall() {
  const { id } = useParams();
  const user = useSelector((state: RootState) => state.user.currentUser);
  const [group, setGroup] = useState<TutorhubGroup | null>(null);
  useEffect(() => { if (id) getGroup(id).then(setGroup); }, [id]);
  if (!group) return <section className={s.page}>Call wird geladen...</section>;
  const allowed = user && (user.id === group.teacherId || group.members.some((member) => member.uid === user.id));
  if (!allowed) return <section className={s.page}><h1>Kein Zugang</h1><p>Du musst Mitglied dieser Gruppe sein.</p><Link to="/Tutorhub/groups">Zu den Gruppen</Link></section>;
  if (!group.callActive) return <section className={s.page}><h1>Der Unterricht hat noch nicht begonnen.</h1><Link to="/Tutorhub/main">Zum Dashboard</Link></section>;
  return <section className={s.page}><div className={s.header}><div><p>{group.subject}</p><h1>{group.name}</h1></div><Link to="/Tutorhub/main">Zum Dashboard</Link></div><iframe title={`${group.name} Videocall`} src={`https://meet.jit.si/${group.roomName}#config.prejoinPageEnabled=true&userInfo.displayName=${encodeURIComponent(user?.name || "TutorHub Nutzer")}`} allow="camera; microphone; fullscreen; display-capture; autoplay" /></section>;
}
