import { useNavigate } from "react-router-dom";
import logoImg from "../assets/nrityaai-logo.png";

export default function Header({ showBack = false, showAbout = true }) {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-left">
        {showBack ? (
          <button
            type="button"
            className="icon-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <div className="logo-block">
            <div className="logo-icon">
              <img
                src={logoImg}
                alt="NrityaAI logo"
                className="logo-img"
                width={52}
                height={52}
              />
            </div>
            <div>
              <h1 className="logo-title">NrityaAI</h1>
              <p className="logo-tagline">Preserving Art. Empowering Talent.</p>
            </div>
          </div>
        )}
      </div>

      {showAbout && (
        <button type="button" className="about-btn" aria-label="About us">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          About Us
        </button>
      )}
    </header>
  );
}
