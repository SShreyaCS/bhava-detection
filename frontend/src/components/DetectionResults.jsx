import { formatBhava, getFeedback } from "../utils/bhava";

export default function DetectionResults({ result, loading, error }) {
  if (loading) {
    return (
      <div className="results-panel">
        <h2 className="results-title">Detection Results</h2>
        <LotusSmall />
        <p className="results-loading">Analyzing your expression…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-panel">
        <h2 className="results-title">Detection Results</h2>
        <LotusSmall />
        <p className="results-error">{error}</p>
      </div>
    );
  }

  if (!result?.face_detected) {
    return (
      <div className="results-panel">
        <h2 className="results-title">Detection Results</h2>
        <LotusSmall />
        <p className="results-error">
          {result?.message || "No face detected. Please try again with a clear frontal face."}
        </p>
      </div>
    );
  }

  const { body, improvement } = getFeedback(
    result.emotion,
    result.bhava,
    result.confidence
  );

  return (
    <div className="results-panel">
      <h2 className="results-title">Detection Results</h2>
      <LotusSmall />

      <div className="result-row">
        <span className="result-icon">🎭</span>
        <div>
          <span className="result-label">Emotion / Bhava</span>
          <span className="result-value gold">
            {formatBhava(result.bhava, result.emotion)}
          </span>
        </div>
      </div>

      <div className="result-row">
        <span className="result-icon">◎</span>
        <div>
          <span className="result-label">Confidence</span>
          <span className="result-value green">
            {result.confidence_percent}%
          </span>
        </div>
      </div>

      <div className="feedback-box">
        <h3>
          <span className="star">★</span> Feedback
        </h3>
        <p className="feedback-body">{body}</p>
        <p className="feedback-improve">
          <strong>Point for improvement:</strong> {improvement}
        </p>
      </div>
    </div>
  );
}

function LotusSmall() {
  return <div className="lotus-small">✦</div>;
}
