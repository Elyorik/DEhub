import { Link } from "react-router-dom";
import s from "./home.module.scss";
import newSuchmaschiene from "../../assets/UpdatesImg/newSuchmaschiene.png";
import newKIWerkzeuge from "../../assets/UpdatesImg/newKIwerkzeuge.png";

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
        <p>Entdecke unsere neuesten Funktionen, die dir helfen, dein Deutschlernen zu optimieren und dich besser auf die DSD-Prüfung vorzubereiten.</p>
        <img src={newKIWerkzeuge} alt="Neue Funktionen" />
      </section>
      <section className={s.searchImprovement}>
        <h2>Verbesserung der Suchmaschine</h2>
        <p>Unsere Suchmaschine wurde verbessert, um dir schnellere und genauere Ergebnisse zu liefern. Finde jetzt noch einfacher die Informationen, die du benötigst.</p>
        <img src={newSuchmaschiene} alt="Suchverbesserung" />
      </section>
      </div>
    </div>
  );
}

export default Home;