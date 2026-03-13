import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import s from "./Schule60.module.scss"

import schuleImage from "../assets/Schule60/60-schule-modified.png"
import img1 from "../assets/Schule60/taschkent1-formatkey-webp-w800r.webp"
import img2 from "../assets/Schule60/Schule.jpg"
import img3 from "../assets/Schule60/L_height.webp"
import img4 from "../assets/Schule60/images (7).jpg"

type Language = "de" | "ru"

/* COUNT ANIMATION */

const useCountUp = (end:number)=>{

const [value,setValue] = useState(0)

useEffect(()=>{

let start = 0

const timer = setInterval(()=>{

start += Math.ceil(end/60)

if(start >= end){
setValue(end)
clearInterval(timer)
}else{
setValue(start)
}

},20)

return ()=>clearInterval(timer)

},[end])

return value
}

/* SCROLL REVEAL */

const useScrollReveal = ()=>{

const [show,setShow] = useState(false)

useEffect(()=>{

const onScroll = ()=>{
if(window.scrollY > 200){
setShow(true)
}
}

window.addEventListener("scroll",onScroll)

return ()=>window.removeEventListener("scroll",onScroll)

},[])

return show
}

/* TEXT */

const content = {

de:{
title:"Schule Nr.60",
subtitle:"Taschkent, Usbekistan",
tagline:"Vorbereitung auf Studium in Deutschland",

students:"Schüler",
teachers:"Lehrer",
founded:"Gegründet",
languages:"Sprachen",

aboutTitle:"Über unsere Schule",

aboutText:
"Unsere Schule bereitet Schüler auf das Studium in Deutschland vor und arbeitet mit deutschen Organisationen zusammen.",

subjectsTitle:"Hauptfächer",

subjects:[
{title:"Deutsch",text:"Intensives Deutschprogramm"},
{title:"Russisch",text:"Sprachliche Ausbildung"},
{title:"Usbekisch",text:"Nationale Kultur"},
{title:"Deutschland Vorbereitung",text:"Studium Vorbereitung"}
],

timelineTitle:"Geschichte der Schule",

timeline:[
{year:"1961",text:"Gründung der Schule"},
{year:"2008",text:"Beitritt zum PASCH Netzwerk"},
{year:"2015",text:"Neue Labore gebaut"},
{year:"2024",text:"Digitale Bildung eingeführt"}
],

quote:"Unsere Schule verbindet Tradition, Innovation und internationale Bildung.",
director:"Direktor",

mapTitle:"Standort der Schule",

galleryTitle:"Galerie",

testimonialsTitle:"Was unsere Schüler sagen",

testimonials:[
{quote:"Eine der besten Schulen.",name:"Anna"},
{quote:"Sehr gutes Deutschprogramm.",name:"Timur"},
{quote:"Ich studiere jetzt in Deutschland.",name:"Madina"}
],

faqTitle:"FAQ",

faq:[
{q:"Welche Sprachen werden unterrichtet?",a:"Deutsch, Russisch und Usbekisch."},
{q:"Bereitet die Schule auf Deutschland vor?",a:"Ja, Schüler werden auf Studium vorbereitet."},
{q:"Hat die Schule Partnerschaften?",a:"Ja mit deutschen Organisationen."},
{q:"Wie viele Schüler gibt es?",a:"Mehr als 1200 Schüler."},
{q:"Gibt es Austauschprogramme?",a:"Ja mit deutschen Schulen."}
],

footer:"Alle Rechte vorbehalten"

},

ru:{
title:"Школа №60",
subtitle:"Ташкент, Узбекистан",
tagline:"Подготовка к обучению в Германии",

students:"Ученики",
teachers:"Учителя",
founded:"Основана",
languages:"Языки",

aboutTitle:"О нашей школе",

aboutText:
"Наша школа готовит учеников к обучению в Германии и сотрудничает с немецкими образовательными организациями.",

subjectsTitle:"Основные предметы",

subjects:[
{title:"Немецкий",text:"Интенсивный немецкий"},
{title:"Русский",text:"Литература и язык"},
{title:"Узбекский",text:"Национальный язык"},
{title:"Подготовка к Германии",text:"Обучение для Германии"}
],

timelineTitle:"История школы",

timeline:[
{year:"1961",text:"Основание школы"},
{year:"2008",text:"Вступление в сеть PASCH"},
{year:"2015",text:"Построены новые лаборатории"},
{year:"2024",text:"Цифровое обучение"}
],

quote:"Наша школа соединяет традиции, инновации и международное образование.",
director:"Директор",

mapTitle:"Местоположение школы",

galleryTitle:"Галерея",

testimonialsTitle:"Что говорят ученики",

testimonials:[
{quote:"Одна из лучших школ.",name:"Анна"},
{quote:"Очень хорошая программа немецкого.",name:"Тимур"},
{quote:"Теперь я учусь в Германии.",name:"Мадина"}
],

faqTitle:"Частые вопросы",

faq:[
{q:"Какие языки преподаются?",a:"Немецкий, русский и узбекский."},
{q:"Готовит ли школа к Германии?",a:"Да, ученики готовятся к обучению."},
{q:"Есть ли партнерства?",a:"Да, с немецкими организациями."},
{q:"Сколько учеников?",a:"Более 1200."},
{q:"Есть ли обменные программы?",a:"Да, с немецкими школами."}
],

footer:"Все права защищены"

}

}

const stats = {
students:1250,
teachers:85,
year:1961,
languages:3
}

export default function Schule60(){

const [language,setLanguage] = useState<Language>("de")
const [visible,setVisible] = useState(false)

const reveal = useScrollReveal()

const students = useCountUp(stats.students)
const teachers = useCountUp(stats.teachers)

const t = content[language]

useEffect(()=>{
setVisible(true)
},[])

const toggleLanguage = ()=>{
setLanguage(prev => prev === "de" ? "ru" : "de")
}

return(

<div className={`${s.page} ${visible ? s.visible : ""}`}>

<button className={s.langToggle} onClick={toggleLanguage}>
{language==="de"?"RU":"DE"}
</button>

<section className={s.hero}>

<div className={s.heroText}>

<div className={s.badge}>PASCH Schule</div>

<h1>{t.title}</h1>
<h2>{t.subtitle}</h2>

<p className={s.tagline}>{t.tagline}</p>

<div className={s.stats}>

<div>
<span>{stats.year}</span>
<p>{t.founded}</p>
</div>

<div>
<span>{students}+</span>
<p>{t.students}</p>
</div>

<div>
<span>{teachers}</span>
<p>{t.teachers}</p>
</div>

<div>
<span>{stats.languages}</span>
<p>{t.languages}</p>
</div>

</div>

</div>

<div className={s.heroImage}>
<img src={schuleImage}/>
</div>

</section>

<section className={`${s.about} ${reveal ? s.reveal : ""}`}>

<h2>{t.aboutTitle}</h2>

<p className={s.aboutText}>
{t.aboutText}
</p>

</section>

<section className={s.subjects}>

<h2>{t.subjectsTitle}</h2>

<div className={s.subjectGrid}>

{t.subjects.map((sub,i)=>(
<div key={i} className={s.subject}>
<h3>{sub.title}</h3>
<p>{sub.text}</p>
</div>
))}

</div>

</section>

<section className={s.timeline}>

<h2>{t.timelineTitle}</h2>

<div className={s.timelineLine}>

{t.timeline.map((item,i)=>(
<div key={i} className={s.timelineItem}>
<span>{item.year}</span>
<p>{item.text}</p>
</div>
))}

</div>

</section>

<section className={s.quote}>

<p>{t.quote}</p>
<span>— {t.director}</span>

</section>

<section className={s.mapSection}>

<h2>{t.mapTitle}</h2>

<div className={s.mapWrapper}>

<iframe
src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4625.164788467146!2d69.2783285!3d41.2963499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8acfce3979c9%3A0xa04f662a066609bd!2z0KjQutC-0LvQsCDihJY2MA!5e1!3m2!1sru!2s!4v1773427764469!5m2!1sru!2s"
width="100%"
height="400"
style={{border:0}}
loading="lazy"
referrerPolicy="no-referrer-when-downgrade"
/>

</div>

</section>

<section className={s.gallery}>

<h2>{t.galleryTitle}</h2>

<div className={s.galleryGrid}>

<img src={img1}/>
<img src={img2}/>
<img src={img3}/>
<img src={img4}/>

</div>

</section>

<section className={s.testimonials}>

<h2>{t.testimonialsTitle}</h2>

<div className={s.testimonialGrid}>

{t.testimonials.map((item,i)=>(
<div key={i} className={s.testimonial}>
<p>"{item.quote}"</p>
<span>— {item.name}</span>
</div>
))}

</div>

</section>

<section className={s.faq}>

<h2>{t.faqTitle}</h2>

{t.faq.map((item,i)=>(
<details key={i}>
<summary>{item.q}</summary>
<p>{item.a}</p>
</details>
))}

</section>

<footer className={s.footer}>

<p>© Schule Nr.60 — {t.footer}</p>

<div>
<Link to="/">Home</Link>
<Link to="/ki">KI</Link>
<Link to="/tutorhub">TutorHub</Link>
<Link to="/suchen">Suchen</Link>
<Link to="/neuigkeiten">Neuigkeiten</Link>
<Link to="/schule60">Schule60</Link>
<Link to="/übersetzer">Übersetzer</Link>
<Link to="/uber-uns">Über uns</Link>
<Link to="/quellen">Quellen</Link>
<Link to="/forum">Forum</Link>
<Link to="/spiele">Spiele</Link>
</div>

</footer>

</div>

)

}