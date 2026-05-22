import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import LotusDivider from "../components/LotusDivider";
import DetectionResults from "../components/DetectionResults";
import { predictImage } from "../api/predict";

export default function UploadPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await predictImage(file);
      setResult(data);
    } catch (err) {
      setError(err.message || "Could not reach server. Is app.py running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showBack className="page-upload">
      <section className="hero compact">
        <h1 className="page-title">AI Bhava Detection</h1>
        <LotusDivider text="Upload your expression for analysis" />
      </section>

      <div className="upload-layout">
        <div className="upload-left glow-card">
          <h3 className="section-label">Upload Image</h3>
          <p className="hint">Select a clear frontal image with visible face</p>

          <div
            className={`upload-zone ${preview ? "has-preview" : ""}`}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFile}
            />
            {preview ? (
              <img src={preview} alt="Preview" className="upload-preview" />
            ) : (
              <div className="upload-placeholder">
                <div className="card-icon-circle small">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="8.5" cy="10.5" r="2" />
                    <path d="M21 16l-5-5L5 19" />
                  </svg>
                </div>
                <span>Click to choose image</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn-gold full"
            disabled={!file || loading}
            onClick={handleAnalyze}
          >
            {loading ? "Analyzing…" : "Analyze Image"}
          </button>

          <button type="button" className="btn-text" onClick={() => navigate("/")}>
            ← Back to home
          </button>
        </div>

        <DetectionResults result={result} loading={loading} error={error} />
      </div>

      <div className="tip-bar">
        <span className="tip-icon">💡</span>
        Tip: Use a well-lit, front-facing photo for best Bhava detection results.
      </div>
    </Layout>
  );
}
