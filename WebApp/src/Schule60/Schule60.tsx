import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import s from "./Schule60.module.scss";

interface SchoolStats {
  students: number;
  teachers: number;
  year: number;
  languages: number;
}

export default function Schule60() {
  const [stats, setStats] = useState<SchoolStats>({
    students: 1250,
    teachers: 85,
    year: 1961,
    languages: 5,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={s.schule60}>
      {/* Hero Section */}
      <section className={`${s.hero} ${isVisible ? s.visible : ""}`}>
        <div className={s.heroContent}>
          <div className={s.heroBadge}>PASCH Schule</div>
          <h1>Schule Nr. 60</h1>
          <h2>Taschkent, Usbekistan</h2>
          <p className={s.heroTagline}>
            Wo Tradition auf Innovation trifft
          </p>
          <div className={s.heroStats}>
            <div className={s.statItem}>
              <span className={s.statNumber}>{stats.year}</span>
              <span className={s.statLabel}>Gegründet</span>
            </div>
            <div className={s.statItem}>
              <span className={s.statNumber}>+{stats.students}</span>
              <span className={s.statLabel}>Schüler</span>
            </div>
            <div className={s.statItem}>
              <span className={s.statNumber}>{stats.teachers}</span>
              <span className={s.statLabel}>Lehrer</span>
            </div>
            <div className={s.statItem}>
              <span className={s.statNumber}>{stats.languages}</span>
              <span className={s.statLabel}>Sprachen</span>
            </div>
          </div>
          <Link to="/tutorhub" className={s.heroButton}>
            Mehr erfahren →
          </Link>
        </div>
        <div className={s.heroVisual}>
          <div className={s.schoolIcon}>
            <svg viewBox="0 0 200 200" className={s.iconSvg}>
              <defs>
                <linearGradient id="schoolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="90" fill="url(#schoolGrad)" />
              <path
                d="M100 30 L170 70 L170 150 L100 190 L30 150 L30 70 Z"
                fill="white"
                opacity="0.9"
              />
              <rect x="85" y="90" width="30" height="60" fill="#667eea" />
              <rect x="60" y="60" width="20" height="30" fill="#764ba2" />
              <rect x="120" y="60" width="20" height="30" fill="#764ba2" />
            </svg>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className={s.about}>
        <div className={s.sectionHeader}>
          <h2>Über unsere Schule</h2>
          <div className={s.underline}></div>
        </div>
        <div className={s.aboutGrid}>
          <div className={s.aboutCard}>
            <div className={s.cardIcon}>🎓</div>
            <h3>Exzellente Bildung</h3>
            <p>
              Wir bieten hochwertige Bildung mit deutschem Fokus und
              internationalem Anspruch. Unsere Schüler werden optimal auf das
              Leben in einer globalisierten Welt vorbereitet.
            </p>
          </div>
          <div className={s.aboutCard}>
            <div className={s.cardIcon}>🌍</div>
            <h3>Internationale Partnerschaften</h3>
            <p>
              Durch das PASCH-Netzwerk pflegen wir enge Beziehungen zu
              deutschen Schulen und Universitäten. Austauschprogramme eröffnen
              neue Perspektiven.
            </p>
          </div>
          <div className={s.aboutCard}>
            <div className={s.cardIcon}>💡</div>
            <h3>Moderne Methoden</h3>
            <p>
              Wir verbinden traditionelle Werte mit innovativen
              Unterrichtsmethoden. Digitale Medien und projektbasiertes Lernen
              sind fester Bestandteil unseres Curriculums.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className={s.programs}>
        <div className={s.sectionHeader}>
          <h2>Unsere Programme</h2>
          <div className={s.underline}></div>
        </div>
        <div className={s.programsGrid}>
          <div className={s.programCard}>
            <div className={s.programHeader}>
              <span className={s.programIcon}>🇩🇪</span>
              <h3>Deutsch als Fremdsprache</h3>
            </div>
            <ul className={s.programList}>
              <li>Intensivkurse von A1 bis C1</li>
              <li>Goethe-Zertifizierung</li>
              <li>Sprachlabore</li>
              <li>Deutsche Lektüre</li>
            </ul>
          </div>
          <div className={s.programCard}>
            <div className={s.programHeader}>
              <span className={s.programIcon}>🔬</span>
              <h3>Naturwissenschaften</h3>
            </div>
            <ul className={s.programList}>
              <li>Moderne Labore</li>
              <li>Wettbewerbe olympiads</li>
              <li>Forschungsprojekte</li>
              <li>Technologie-Integration</li>
            </ul>
          </div>
          <div className={s.programCard}>
            <div className={s.programHeader}>
              <span className={s.programIcon}>🎨</span>
              <h3>Kultur & Kunst</h3>
            </div>
            <ul className={s.programList}>
              <li>Musikensembles</li>
              <li>Theatergruppen</li>
              <li>Kunstausstellungen</li>
              <li>Kulturelle Events</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={s.contact}>
        <div className={s.contactContainer}>
          <div className={s.contactInfo}>
            <h2>Kontaktieren Sie uns</h2>
            <p>
              Haben Sie Fragen? Wir freuen uns von Ihnen zu hören und helfen
              Ihnen gerne weiter.
            </p>
            <div className={s.contactDetails}>
              <div className={s.contactItem}>
                <span className={s.contactIcon}>📍</span>
                <div>
                  <strong>Adresse</strong>
                  <p>Taschkent, Usbekistan</p>
                </div>
              </div>
              <div className={s.contactItem}>
                <span className={s.contactIcon}>📞</span>
                <div>
                  <strong>Telefon</strong>
                  <p>+998 71 XXX XX XX</p>
                </div>
              </div>
              <div className={s.contactItem}>
                <span className={s.contactIcon}>✉️</span>
                <div>
                  <strong>E-Mail</strong>
                  <p>info@schule60.uz</p>
                </div>
              </div>
            </div>
          </div>
          <div className={s.contactAction}>
            <Link to="/tutorhub" className={s.actionButton}>
              Zum Forum →
            </Link>
            <Link to="/suchen" className={s.actionButtonSecondary}>
              Mehr über DEhub
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={s.footer}>
        <div className={s.footerContent}>
          <div className={s.footerLogo}>
            <span>🏫</span> Schule Nr. 60 Taschkent
          </div>
          <div className={s.footerLinks}>
            <Link to="/">DEhub Home</Link>
            <Link to="/ki">KI Tools</Link>
            <Link to="/tutorhub">TutorHub</Link>
          </div>
          <p className={s.footerCopyright}>
            © 2024 Schule Nr. 60 - PASCH Netzwerk
          </p>
        </div>
      </footer>
    </div>
  );
}
