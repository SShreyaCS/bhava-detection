import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import LotusDivider from "../components/LotusDivider";
import DetectionResults from "../components/DetectionResults";
import { predictImage } from "../api/predict";

export default function LiveCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err) {
        setCameraError(
          "Camera access denied or unavailable. Please allow camera permission."
        );
      }
    }

    startCamera();

    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !cameraReady) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      setError("Camera not ready. Wait a moment and try again.");
      return;
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);

    setLoading(true);
    setError(null);
    setResult(null);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setLoading(false);
        setError("Failed to capture frame.");
        return;
      }
      try {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        const data = await predictImage(file);
        setResult(data);
      } catch (err) {
        setError(err.message || "Prediction failed.");
      } finally {
        setLoading(false);
      }
    }, "image/jpeg", 0.92);
  };

  return (
    <Layout showBack className="page-live-capture">
      <section className="hero compact">
        <h1 className="page-title">AI Bhava Detection</h1>
        <LotusDivider />
      </section>

      <div className="capture-layout">
        <div className="capture-left">
          <p className="align-text">Align your face within the circle</p>

          <div className="camera-circle glow-ring">
            {cameraError ? (
              <p className="camera-err">{cameraError}</p>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted />
            )}
            <canvas ref={canvasRef} hidden />
          </div>

          <p className="capture-hint">
            Please position your face in the center and ensure good lighting.
          </p>

          <button
            type="button"
            className="btn-gold full"
            disabled={!cameraReady || loading}
            onClick={handleCapture}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
              <path d="M3 7h2l2-3h8l2 3h2a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z" />
              <circle cx="10" cy="12" r="3" />
            </svg>
            {loading ? "Analyzing…" : "Capture"}
          </button>
        </div>

        <DetectionResults result={result} loading={loading} error={error} />
      </div>

      <div className="tip-bar">
        <span className="tip-icon">💡</span>
        Tip: Remove glasses, hats or any face occlusions for best results.
      </div>
    </Layout>
  );
}
