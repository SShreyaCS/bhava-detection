import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import LotusDivider from "../components/LotusDivider";

export default function LiveStart() {
  const navigate = useNavigate();

  return (
    <Layout showBack className="page-live-start">
      <section className="live-start-hero">
        <h1 className="page-title">AI Bhava Detection</h1>
        <LotusDivider text="Discover the emotion and beauty in every Bhava." />

        <div className="mandala-ring">
          <div className="mandala-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
        </div>

        <p className="open-camera-text">Open Camera to Begin</p>

        <button
          type="button"
          className="btn-gold btn-large"
          onClick={() => navigate("/live/capture")}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
            <path d="M3 7h2l2-3h8l2 3h2a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z" />
            <circle cx="10" cy="12" r="3" />
          </svg>
          Open Camera
        </button>
      </section>

      <div className="tip-bar">
        <span className="tip-icon">💡</span>
        Tip: Ensure good lighting and face clearly visible for best results.
      </div>
    </Layout>
  );
}
