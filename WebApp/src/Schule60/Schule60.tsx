import { useEffect, useRef, useState } from "react";
import styles from "./App.module.scss";

const sections = ["Hero", "About", "Programs", "Gallery", "Contact"];

export default function App() {
  const sectionRefs = useRef<HTMLElement[]>([]);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight =
            document.documentElement.scrollHeight - window.innerHeight;

          setProgress((scrollTop / docHeight) * 100);

          for (let i = 0; i < sectionRefs.current.length; i++) {
            const rect =
              sectionRefs.current[i].getBoundingClientRect();
            if (
              rect.top <= window.innerHeight * 0.55 &&
              rect.bottom >= 0
            ) {
              setActive(i);
              break;
            }
          }

          reveal();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    reveal();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const reveal = () => {
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        el.classList.add(styles.visible);
      }
    });
  };

  const scrollTo = (i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.app}>
      {/* Progress bar */}
      <div
        className={styles.progress}
        style={{ width: `${progress}%` }}
      />

      {/* Nav dots */}
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

      {sections.map((title, i) => (
        <section
          key={title}
          ref={(el) => {
            if (el) sectionRefs.current[i] = el;
          }}
          className={styles.section}
        >
          <div className={styles.inner}>
            <h1 data-reveal>{title}</h1>
            <p data-reveal>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Architecto, voluptas.
            </p>

            <div className={styles.cards}>
              {[1, 2, 3].map((c) => (
                <div key={c} className={styles.card} data-reveal>
                  Card {c}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
