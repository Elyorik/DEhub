import { Link } from "react-router-dom";
import s from "./home.module.scss";

function Home() {
  return (
    <div className={s.home}>
      <section className={s.landing}>
        <h1>DEBOT</h1>
        <h2>Deutsch lernen = DSD bestehen.</h2>
        <p>Ganz einfach! Der Ort, an dem du Antworten findest und sicher zur Prüfung gehst.</p>
        <Link to="/suchen">
          <button>Suchen</button>
        </Link>
      </section>
      <div className={s.containers}>
      <section className={s.newFeatures}>
        Neue Funktionen
      </section>
      <section className={s.searchImprovement}>
        Verbesserung der Suchmaschine
      </section>
      </div>
    </div>
  );
}

export default Home;