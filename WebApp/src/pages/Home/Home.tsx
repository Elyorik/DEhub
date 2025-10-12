import { Link } from "react-router-dom";
import s from "./home.module.scss";
import newSuchmaschiene from "../../assets/UpdatesImg/newSuchmaschiene.png";
import newKIWerkzeuge from "../../assets/UpdatesImg/newKIWerkzeuge.png";
import VisitorsCounter from "../../components/VisitorsCounter/VisitorCounter";

function Home() {
  return (
    <div className={s.home}>
      <section className={s.landing}>
        <h1>DEhub</h1>
        <h2>Deutsch lernen = DSD bestehen.</h2>
        <p>Ganz einfach! Der Ort, an dem du Antworten findest und sicher zur Prüfung gehst.</p>
        <Link to="/suchen">
          <button>Suchen</button>
        </Link>
      </section>

      <div className={s.containers}>
        <section className={s.newFeatures}>
          <h2>Neue Funktionen</h2>
          <p>Entdecke unsere neuesten Funktionen, die dir helfen, dein Deutschlernen zu optimieren...</p>
          <img src={newKIWerkzeuge} alt="Neue Funktionen" />
        </section>
        <section className={s.searchImprovement}>
          <h2>Verbesserung der Suchmaschine</h2>
          <p>Unsere Suchmaschine wurde verbessert...</p>
          <img src={newSuchmaschiene} alt="Suchverbesserung" />
        </section>
      </div>
      <VisitorsCounter />
    </div>
  );
}

export default Home; 
