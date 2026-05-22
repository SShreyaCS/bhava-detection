import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import LotusDivider from "../components/LotusDivider";
import FooterFeatures from "../components/FooterFeatures";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Layout className="page-home">
      <section className="hero">
        <h1 className="page-title">AI Bhava Detection</h1>
        <LotusDivider text="Discover the beauty of Bharatiya Natya through AI" />
        <h2 className="choose-title">Choose an Option</h2>
      </section>

      <div className="option-cards">
        <div className="option-card glow-card">
          <div className="card-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="10.5" r="2" />
              <path d="M21 16l-5-5L5 19" />
            </svg>
          </div>
          <h3>Upload an Image</h3>
          <p>
            Upload a clear image of your expression for AI analysis.
          </p>
          <button
            type="button"
            className="btn-gold"
            onClick={() => navigate("/upload")}
          >
            <UploadIcon /> Upload Image
          </button>
        </div>

        <div className="option-card glow-card">
          <div className="card-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <h3>Live Detection</h3>
          <p>
            Use your camera for real-time detection of expressions.
          </p>
          <button
            type="button"
            className="btn-gold"
            onClick={() => navigate("/live")}
          >
            <CameraIcon /> Start Live Detection
          </button>
        </div>
      </div>

      <FooterFeatures />
    </Layout>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path d="M10 2v12M6 6l4-4 4 4M4 16h12" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
      <path d="M3 7h2l2-3h8l2 3h2a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z" />
      <circle cx="10" cy="12" r="3" />
    </svg>
  );
}
