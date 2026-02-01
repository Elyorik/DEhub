import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h1>404</h1>
      <p>Seite nicht gefunden</p>
      <Link to="/">Zurück zur Startseite</Link>
    </div>
  );
}