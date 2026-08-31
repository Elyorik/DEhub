import { Link } from "react-router-dom";

export default function TutorhubBackToDashboard() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto 18px", padding: "0 0" }}>
      <Link
        to="/Tutorhub/main"
        style={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: 8,
          padding: "10px 12px",
          background: "#ffffff",
          border: "1px solid #e4e7ec",
          color: "#101828",
          fontWeight: 900,
          textDecoration: "none",
          boxShadow: "0 8px 20px rgba(16, 24, 40, 0.05)",
        }}
      >
        Zurueck zum Dashboard
      </Link>
    </div>
  );
}