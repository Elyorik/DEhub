import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import s from "./Schule60.module.scss";
import schuleImage from "../assets/Schule60/60-schule-modified.png";
import img1 from "../assets/Schule60/taschkent1-formatkey-webp-w800r.webp";
import img2 from "../assets/Schule60/Schule.jpg";
import img3 from "../assets/Schule60/L_height.webp";
import img4 from "../assets/Schule60/images (7).jpg";

type Language = "de" | "ru";

interface SchoolStats {
  students: number;
  teachers: number;
  year: number;
  languages: number;
}

const content = {
  de: {
    hero: {
      badge: "PASCH Schule",
      title: "Schule Nr. 60",
      subtitle: "Taschkent, Usbekistan",
      tagline: "Wo Tradition auf Innovation trifft",
      founded: "Gegründet",
      students: "Schüler",
      teachers: "Lehrer",
      languages: "Sprachen",
      cta: "Mehr erfahren →",
    },
    about: {
      title: "Über unsere Schule",
      cards: [
        {
          icon: "🎓",
          title: "Exzellente Bildung",
          desc: "Wir bieten hochwertige Bildung mit deutschem Fokus und internationalem Anspruch. Unsere Schüler werden optimal auf das Leben in einer globalisierten Welt vorbereitet.",
        },
        {
          icon: "🌍",
          title: "Internationale Partnerschaften",
          desc: "Durch das PASCH-Netzwerk pflegen wir enge Beziehungen zu deutschen Schulen und Universitäten. Austauschprogramme eröffnen neue Perspektiven.",
        },
        {
          icon: "💡",
          title: "Moderne Methoden",
          desc: "Wir verbinden traditionelle Werte mit innovativen Unterrichtsmethoden. Digitale Medien und projektbasiertes Lernen sind fester Bestandteil unseres Curriculums.",
        },
      ],
    },
    programs: {
      title: "Unsere Programme",
      items: [
        {
          icon: "🇩🇪",
          title: "Deutsch als Fremdsprache",
          list: ["Intensivkurse von A1 bis C1", "Goethe-Zertifizierung", "Sprachlabore", "Deutsche Lektüre"],
        },
        {
          icon: "🔬",
          title: "Naturwissenschaften",
          list: ["Moderne Labore", "Wettbewerbe olympiads", "Forschungsprojekte", "Technologie-Integration"],
        },
        {
          icon: "🎨",
          title: "Kultur & Kunst",
          list: ["Musikensembles", "Theatergruppen", "Kunstausstellungen", "Kulturelle Events"],
        },
      ],
    },
    contact: {
      title: "Kontaktieren Sie uns",
      desc: "Haben Sie Fragen? Wir freuen uns von Ihnen zu hören und helfen Ihnen gerne weiter.",
      address: "Taschkent, Usbekistan",
      phone: "+998 71 XXX XX XX",
      email: "info@schule60.uz",
      cta: "Zum Forum →",
      ctaSecondary: "Mehr über DEhub",
    },
    footer: {
      logo: "Schule Nr. 60 Taschkent",
      copyright: "© 2024 Schule Nr. 60 - PASCH Netzwerk",
    },
  },
  ru: {
    hero: {
      badge: "PASCH Школа",
      title: "Школа № 60",
      subtitle: "Ташкент, Узбекистан",
      tagline: "Где традиции встречаются с инновациями",
      founded: "Основана",
      students: "Ученики",
      teachers: "Учителя",
      languages: "Языки",
      cta: "Узнать больше →",
    },
    about: {
      title: "О нашей школе",
      cards: [
        {
          icon: "🎓",
          title: "Отличное образование",
          desc: "Мы предлагаем качественное образование с немецким уклоном и международным подходом. Наши ученики оптимально подготовлены к жизни в глобализированном мире.",
        },
        {
          icon: "🌍",
          title: "Международные партнёрства",
          desc: "Благодаря сети PASCH мы поддерживаем тесные связи с немецкими школами и университетами. Программы обмена открывают новые перспективы.",
        },
        {
          icon: "💡",
          title: "Современные методы",
          desc: "Мы сочетаем традиционные ценности с инновационными методами обучения. Цифровые медиа и проектное обучение являются неотъемлемой частью нашей учебной программы.",
        },
      ],
    },
    programs: {
      title: "Наши программы",
      items: [
        {
          icon: "🇩🇪",
          title: "Немецкий язык как иностранный",
          list: ["Интенсивные курсы от A1 до C1", "Сертификация Гёте", "Языковые лаборатории", "Немецкая литература"],
        },
        {
          icon: "🔬",
          title: "Естественные науки",
          list: ["Современные лаборатории", "Олимпиады и конкурсы", "Исследовательские проекты", "Интеграция технологий"],
        },
        {
          icon: "🎨",
          title: "Культура и искусство",
          list: ["Музыкальные ансамбли", "Театральные группы", "Художественные выставки", "Культурные мероприятия"],
        },
      ],
    },
    contact: {
      title: "Свяжитесь с нами",
      desc: "У вас есть вопросы? Мы будем рады услышать вас и помочь.",
      address: "Ташкент, Узбекистан",
      phone: "+998 71 XXX XX XX",
      email: "info@schule60.uz",
      cta: "На форум →",
      ctaSecondary: "Подробнее о DEhub",
    },
    footer: {
      logo: "Школа № 60 Ташкент",
      copyright: "© 2024 Школа № 60 - Сеть PASCH",
    },
  },
};

export default function Schule60() {
  const [language, setLanguage] = useState<Language>("de");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const t = content[language];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toggleLanguage = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setLanguage((prev) => (prev === "de" ? "ru" : "de"));
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className={`${s.schule60} ${isAnimating ? s.fadeOut : ""} ${isVisible ? s.visible : ""}`}>
      {/* Language Toggle Button */}
      <button className={s.langToggle} onClick={toggleLanguage}>
        <span className={s.langIcon}>🌐</span>
        <span className={s.langLabel}>DE</span>
        <span className={s.langDivider}>→</span>
        <span className={s.langLabel}>RU</span>
      </button>

      {/* Hero Section */}
      <section className={`${s.hero} ${isVisible ? s.visible : ""}`}>
        <div className={s.heroContent}>
          <div className={s.heroBadge}>{t.hero.badge}</div>
          <h1>{t.hero.title}</h1>
          <h2>{t.hero.subtitle}</h2>
          <p className={s.heroTagline}>{t.hero.tagline}</p>
          <div className={s.heroStats}>
            <div className={s.statItem}>
              <span className={s.statNumber}>{stats.year}</span>
              <span className={s.statLabel}>{t.hero.founded}</span>
            </div>
            <div className={s.statItem}>
              <span className={s.statNumber}>+{stats.students}</span>
              <span className={s.statLabel}>{t.hero.students}</span>
            </div>
            <div className={s.statItem}>
              <span className={s.statNumber}>{stats.teachers}</span>
              <span className={s.statLabel}>{t.hero.teachers}</span>
            </div>
            <div className={s.statItem}>
              <span className={s.statNumber}>{stats.languages}</span>
              <span className={s.statLabel}>{t.hero.languages}</span>
            </div>
          </div>
          <a href="https://www.pasch-net.de/de/pasch-schulen/schulportraets/asien/uzb/schule-nr-60-taschkent.html" target="_blank" rel="noopener noreferrer" className={s.heroButton}>
            {t.hero.cta}
          </a>
        </div>
        <div className={s.heroVisual}>
          <img src={schuleImage} alt="Schule Nr. 60" className={s.schoolImage} />
        </div>
      </section>

      {/* About Section */}
      <section className={s.about}>
        <div className={s.sectionHeader}>
          <h2>{t.about.title}</h2>
          <div className={s.underline}></div>
        </div>
        <div className={s.aboutGrid}>
          {t.about.cards.map((card, index) => (
            <div key={index} className={s.aboutCard}>
              <div className={s.cardIcon}>{card.icon}</div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs Section */}
      <section className={s.programs}>
        <div className={s.sectionHeader}>
          <h2>{t.programs.title}</h2>
          <div className={s.underline}></div>
        </div>
        <div className={s.programsGrid}>
          {t.programs.items.map((program, index) => (
            <div key={index} className={s.programCard}>
              <div className={s.programHeader}>
                <span className={s.programIcon}>{program.icon}</span>
                <h3>{program.title}</h3>
              </div>
              <ul className={s.programList}>
                {program.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section className={s.gallery}>
        <div className={s.sectionHeader}>
          <h2>Unsere Schule in Bildern</h2>
          <div className={s.underline}></div>
        </div>
        <div className={s.galleryGrid}>
          <div className={s.galleryItem}>
            <img src={img1} alt="Schule 60" />
          </div>
          <div className={s.galleryItem}>
            <img src={img2} alt="Schule 60" />
          </div>
          <div className={s.galleryItem}>
            <img src={img3} alt="Schule 60" />
          </div>
          <div className={s.galleryItem}>
            <img src={img4} alt="Schule 60" />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={s.contact}>
        <div className={s.contactContainer}>
          <div className={s.contactInfo}>
            <h2>{t.contact.title}</h2>
            <p>{t.contact.desc}</p>
            <div className={s.contactDetails}>
              <div className={s.contactItem}>
                <span className={s.contactIcon}>📍</span>
                <div>
                  <strong>Adresse</strong>
                  <p>{t.contact.address}</p>
                </div>
              </div>
              <div className={s.contactItem}>
                <span className={s.contactIcon}>📞</span>
                <div>
                  <strong>Telefon</strong>
                  <p>{t.contact.phone}</p>
                </div>
              </div>
              <div className={s.contactItem}>
                <span className={s.contactIcon}>✉️</span>
                <div>
                  <strong>E-Mail</strong>
                  <p>{t.contact.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={s.footer}>
        <div className={s.footerContent}>
          <div className={s.footerLogo}>
            <span>🏫</span> {t.footer.logo}
          </div>
          <div className={s.footerLinks}>
            <Link to="/">DEhub Home</Link>
            <Link to="/ki">KI Tools</Link>
            <Link to="/tutorhub">TutorHub</Link>
          </div>
          <p className={s.footerCopyright}>{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}

const stats = {
  students: 1250,
  teachers: 85,
  year: 1961,
  languages: 5,
};
