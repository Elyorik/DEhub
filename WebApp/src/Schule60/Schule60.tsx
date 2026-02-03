import { useEffect, useRef, useState } from "react";
import styles from "./Schule60.module.scss";

const sections = [
  { id: "hero", title: "Hero" },
  { id: "about", title: "About" },
  { id: "programs", title: "Programs" },
  { id: "gallery", title: "Gallery" },
  { id: "contact", title: "Contact" },
];

export default function Schule60() {
  const sectionRefs = useRef<HTMLElement[]>([]);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          const doc =
            document.documentElement.scrollHeight - window.innerHeight;

          setScrollY(y);
          setProgress((y / doc) * 100);

          // active section (center based)
          const center = window.innerHeight / 2;
          let min = Infinity;
          let index = 0;

          sectionRefs.current.forEach((sec, i) => {
            const r = sec.getBoundingClientRect();
            const dist = Math.abs(r.top + r.height / 2 - center);
            if (dist < min) {
              min = dist;
              index = i;
            }
          });

          setActive(index);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth" });
  };

  const sectionProgress = (i: number) => {
    const sec = sectionRefs.current[i];
    if (!sec) return 0;

    const start = sec.offsetTop - window.innerHeight;
    const end = sec.offsetTop + sec.offsetHeight;
    const raw = (scrollY - start) / (end - start);

    return Math.min(1, Math.max(0, raw));
  };

  return (
    <div className={styles.app}>
      {/* progress */}
      <div className={styles.progress} style={{ width: `${progress}%` }} />

      {/* nav */}
      <nav className={styles.nav}>
        {sections.map((_, i) => (
          <button
            key={i}
            aria-current={active === i}
            className={active === i ? styles.active : ""}
            onClick={() => scrollTo(i)}
          />
        ))}
      </nav>

      {sections.map((sec, i) => {
        const p = sectionProgress(i);

        return (
          <section
            key={sec.id}
            ref={(el) => el && (sectionRefs.current[i] = el)}
            className={`${styles.section} ${styles[sec.id]}`}
          >
            <div className={styles.inner}>
              <h1
                style={{
                  transform: `translateY(${60 - p * 60}px)`,
                  opacity: p,
                }}
              >
                {sec.title}
              </h1>

              <p
                style={{
                  transform: `translateY(${40 - p * 40}px)`,
                  opacity: p * 0.9,
                }}
              >
                Scroll-driven animation. Not reveal. Not fake.
              </p>

              <div className={styles.cards}>
                {[1, 2, 3].map((c, idx) => (
                  <div
                    key={c}
                    className={styles.card}
                    style={{
                      transform: `
                        translateY(${80 - p * 80}px)
                        scale(${0.95 + p * 0.05})
                      `,
                      opacity: Math.max(0, p - idx * 0.15),
                    }}
                  >
                    Card {c}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
