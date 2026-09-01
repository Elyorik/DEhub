import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import s from "./home.module.scss";
import newSuchmaschiene from "../../assets/UpdatesImg/newSuchmaschiene.png";
import newKIWerkzeuge from "../../assets/UpdatesImg/newKIWerkzeuge.png";
import newSchule60 from "../../assets/UpdatesImg/newSchule60.png";
import counterStyle from "../../components/VisitorsCounter/visitorCounter.module.scss";
import { subscribeToCalendarEvents, type CalendarEvent } from "../../services/calendarEvents";

// ===== Particle Hero Component =====
import { useRef } from "react";

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  ease: number;
}

function ParticleHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);

  useEffect(() => {
    // The static mobile hero avoids running an expensive canvas animation on phones
    // and also respects visitors who request reduced motion.
    const shouldUseStaticHero = window.matchMedia(
      "(max-width: 767px), (prefers-reduced-motion: reduce)",
    ).matches;
    if (shouldUseStaticHero) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = {
      particleCount: 1400,
      particleSize: 1.3,
      mouseRadius: 130,
      text: "DEhub",
      fontSize: 160,
      colors: ["#2563eb", "#60a5fa", "#93c5fd", "#38bdf8", "#a5b4fc"],
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
      initParticles();
    };

    const getTextPositions = (text: string) => {
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return [];

      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;

      tempCtx.font = `300 ${config.fontSize}px Georgia, serif`;
      tempCtx.fillStyle = "white";
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";
      tempCtx.fillText(text, canvas.width / 2, canvas.height / 2);

      const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      const positions: { x: number; y: number }[] = [];
      const step = 4;

      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const index = (y * canvas.width + x) * 4;
          if (imageData.data[index + 3] > 128) {
            positions.push({ x, y });
          }
        }
      }
      return positions;
    };

    const initParticles = () => {
      const positions = getTextPositions(config.text);
      const count = Math.max(config.particleCount, positions.length);
      const particles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const targetX =
          i < positions.length
            ? positions[i].x
            : Math.random() * canvas.width;
        const targetY =
          i < positions.length
            ? positions[i].y
            : Math.random() * canvas.height;

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          targetX,
          targetY,
          vx: 0,
          vy: 0,
          size: Math.random() * config.particleSize + 0.5,
          color: config.colors[Math.floor(Math.random() * config.colors.length)],
          alpha: Math.random() * 0.5 + 0.3,
          ease: Math.random() * 0.025 + 0.015,
        });
      }

      particlesRef.current = particles;
    };

    const animate = () => {
      // Preserve a bright canvas while retaining the soft motion trails.
      ctx.fillStyle = "rgba(248, 250, 252, 0.16)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      particlesRef.current.forEach((p) => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.mouseRadius && dist > 0) {
          const force = (config.mouseRadius - dist) / config.mouseRadius;
          p.vx -= (dx / dist) * force * 2.5;
          p.vy -= (dy / dist) * force * 2.5;
        }

        p.vx += (p.targetX - p.x) * p.ease;
        p.vy += (p.targetY - p.y) * p.ease;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", resize);

    resize();
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className={s.particleHero}>
      <canvas ref={canvasRef} className={s.particleCanvas} />
      <div className={s.particleContent}>
        <h1 className={s.particleTitle}>DEhub</h1>
        <p className={s.particleSubtitle}>Deutsch lernen = DSD bestehen</p>
        
        <Link to="/suchen" className={s.particleButton}>
          Suchen
        </Link>
      </div>
      <div className={s.scrollIndicator} aria-hidden="true">
        <span>Scroll</span>
        <div className={s.scrollArrow} />
      </div>
    </div>
  );
}

// ===== Feature Card Configuration =====
interface FeatureCard {
  title: string;
  description: string;
  image: string;
  link: string;
  bgColor: string;
  isSpecial?: boolean;
}

const featureCards: FeatureCard[] = [
  {
    title: "Neue Funktionen",
    description: "Entdecke unsere neuesten Funktionen, die dir helfen, dein Deutschlernen zu optimieren...",
    image: newKIWerkzeuge,
    link: "/ki",
    bgColor: "#fff7f8",
  },
  {
    title: "Verbesserung der Suchmaschine",
    description: "Unsere Suchmaschine wurde verbessert...",
    image: newSuchmaschiene,
    link: "/suchen",
    bgColor: "#f2f8ff",
  },
  {
    title: "Goethe-Schule Nr. 60",
    description: "Entdecke alles über unsere Schule",
    image: newSchule60,
    link: "/schule60",
    bgColor: "#e8f5e9",
    isSpecial: true,
  },
];

// ===== Reusable Feature Card Component =====
function FeatureCardComponent({ card }: { card: FeatureCard }) {
  if (card.isSpecial) {
    return (
      <Link to={card.link} className={s.specialCard}>
        <div className={s.specialCardContent}>
          <h2>{card.title}</h2>
          <p>{card.description}</p>
        </div>
        <div className={s.specialCardImage}>
          <img src={card.image} alt={card.title} />
        </div>
      </Link>
    );
  }

  return (
    <Link to={card.link} className={s.featureCard} style={{ background: card.bgColor }}>
      <h2>{card.title}</h2>
      <p>{card.description}</p>
      <img src={card.image} alt={card.title} />
    </Link>
  );
}

const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function LearningCalendar() {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  useEffect(() => subscribeToCalendarEvents(setEvents), []);

  const currentMonthEvents = events.filter((event) => event.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`));
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const upcomingEvents = events.filter((event) => event.date >= todayKey);
  const selectedEvent = currentMonthEvents.find((event) => event.id === selectedEventId) ?? null;
  const eventLabel = (type?: CalendarEvent["type"]) => type === "deadline" ? "Deadline" : type === "event" ? "Termin" : "Prüfung";

  return (
    <section className={s.calendarSection} aria-labelledby="calendar-title">
      <div className={s.calendarIntro}>
        <span className={s.sectionEyebrow}>Lernplan</span>
        <h2 id="calendar-title">Dein Lernkalender</h2>
        <p>Plane deine DSD-Vorbereitung und behalte wichtige Termine im Blick.</p>
        <Link to="/Tutorhub/main" className={s.calendarLink}>Bereite dich für deine Prüfungen mit uns vor</Link>
      </div>
      <div className={s.calendarCard}>
        <div className={s.calendarHeader}>
          <button type="button" onClick={() => setVisibleMonth(new Date(year, month - 1, 1))} aria-label="Vorheriger Monat">‹</button>
          <h3>{monthNames[month]} {year}</h3>
          <button type="button" onClick={() => setVisibleMonth(new Date(year, month + 1, 1))} aria-label="Nächster Monat">›</button>
        </div>
        <div className={s.calendarGrid}>
          {weekdays.map((day) => <span key={day} className={s.weekday}>{day}</span>)}
          {Array.from({ length: firstWeekday }).map((_, index) => <span key={`empty-${index}`} aria-hidden="true" />)}
          {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => {
            const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = events.filter((event) => event.date === date);
            const isSelected = dayEvents.some((event) => event.id === selectedEventId);
            const eventType = dayEvents[0]?.type || "event";
            return (
              <button
                key={day}
                type="button"
                className={`${s.calendarDay} ${isCurrentMonth && day === today.getDate() ? s.today : ""} ${dayEvents.length ? s.hasEvent : ""} ${s[`event${eventType[0].toUpperCase()}${eventType.slice(1)}`]} ${isSelected ? s.selectedDay : ""}`}
                onClick={() => dayEvents.length && setSelectedEventId(dayEvents[0].id)}
                aria-label={dayEvents.length ? `${day}. ${monthNames[month]}: ${dayEvents.map((event) => event.title).join(", ")}` : `${day}. ${monthNames[month]}`}
                aria-pressed={isSelected}
              >{day}</button>
            );
          })}
        </div>
        <div className={s.calendarLegend}><span><i className={s.todayMarker} />Heute</span><span><i className={s.examMarker} />Prüfung</span><span><i className={s.eventMarker} />Termin</span><span><i className={s.deadlineMarker} />Deadline</span></div>
        {selectedEvent && <div className={`${s.selectedEvent} ${s[`selected${(selectedEvent.type || "event")[0].toUpperCase()}${(selectedEvent.type || "event").slice(1)}`]}`}><strong>{eventLabel(selectedEvent.type)} · {selectedEvent.date.slice(8, 10)}.{selectedEvent.date.slice(5, 7)}.{selectedEvent.date.slice(0, 4)}</strong><span>{selectedEvent.title}</span></div>}
        {upcomingEvents.length > 0 && (
          <div className={s.eventList}>
            <p className={s.upcomingTitle}>Kommende Termine</p>
            {upcomingEvents.map((event) => <button className={s[`list${(event.type || "event")[0].toUpperCase()}${(event.type || "event").slice(1)}`]} type="button" key={event.id} onClick={() => { setVisibleMonth(new Date(`${event.date}T00:00:00`)); setSelectedEventId(event.id); }}><time>{event.date.slice(8, 10)}.{event.date.slice(5, 7)}.</time><span>{event.title}<small>{eventLabel(event.type)}</small></span></button>)}
          </div>
        )}
      </div>
    </section>
  );
}

function Home() {
  const [online, setOnline] = useState<number>(0);

  useEffect(() => {
    const updateOnline = () => {
      const data = localStorage.getItem("onlineCount");
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setOnline(parsed.value || 0);
        } catch (e) {
          console.error("Ошибка чтения localStorage:", e);
        }
      }
    };

    updateOnline();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "onlineCount") updateOnline();
    };
    window.addEventListener("storage", handleStorageChange);

    const interval = setInterval(updateOnline, 10000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={s.home}>
      {/* ===== PARTICLE HERO SECTION ===== */}
      <ParticleHero />
      {/* ===== FEATURE CARDS ===== */}
      <div className={s.containers}>
        {featureCards.map((card, index) => (
          <FeatureCardComponent key={index} card={card} />
        ))}
      </div>
      <LearningCalendar />
    </div>
  );
}

export default Home;
