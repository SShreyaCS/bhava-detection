const API_PREDICT = "/predict";

const tabs = document.querySelectorAll(".tab");
const panelUpload = document.getElementById("panel-upload");
const panelLive = document.getElementById("panel-live");

const fileInput = document.getElementById("file-input");
const uploadPreviewWrap = document.getElementById("upload-preview-wrap");
const uploadPreview = document.getElementById("upload-preview");
const btnAnalyzeUpload = document.getElementById("btn-analyze-upload");

const cameraVideo = document.getElementById("camera-video");
const captureCanvas = document.getElementById("capture-canvas");
const cameraHint = document.getElementById("camera-hint");
const btnStartCamera = document.getElementById("btn-start-camera");
const btnCapture = document.getElementById("btn-capture");
const btnStopCamera = document.getElementById("btn-stop-camera");
const capturePreviewWrap = document.getElementById("capture-preview-wrap");
const capturePreview = document.getElementById("capture-preview");

const resultsSection = document.getElementById("results");
const resultsError = document.getElementById("results-error");
const resultsSuccess = document.getElementById("results-success");
const resEmotion = document.getElementById("res-emotion");
const resBhava = document.getElementById("res-bhava");
const resConfidence = document.getElementById("res-confidence");
const probContainer = document.getElementById("probabilities");

let cameraStream = null;
let uploadFile = null;

// Tab switching
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab;
    panelUpload.classList.toggle("active", target === "upload");
    panelLive.classList.toggle("active", target === "live");
    if (target !== "live") stopCamera();
  });
});

// Upload image
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  uploadFile = file || null;
  if (!uploadFile) {
    uploadPreviewWrap.classList.add("hidden");
    btnAnalyzeUpload.disabled = true;
    return;
  }
  uploadPreview.src = URL.createObjectURL(uploadFile);
  uploadPreviewWrap.classList.remove("hidden");
  btnAnalyzeUpload.disabled = false;
});

btnAnalyzeUpload.addEventListener("click", async () => {
  if (!uploadFile) return;
  await runPrediction(uploadFile);
});

// Live camera
btnStartCamera.addEventListener("click", startCamera);
btnStopCamera.addEventListener("click", stopCamera);
btnCapture.addEventListener("click", captureAndAnalyze);

async function startCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
    cameraVideo.srcObject = cameraStream;
    cameraVideo.classList.add("active");
    cameraHint.classList.add("hidden");
    btnStartCamera.disabled = true;
    btnCapture.disabled = false;
    btnStopCamera.disabled = false;
  } catch (err) {
    showError("Camera access denied or unavailable: " + err.message);
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((t) => t.stop());
    cameraStream = null;
  }
  cameraVideo.srcObject = null;
  cameraVideo.classList.remove("active");
  cameraHint.classList.remove("hidden");
  btnStartCamera.disabled = false;
  btnCapture.disabled = true;
  btnStopCamera.disabled = true;
  capturePreviewWrap.classList.add("hidden");
}

async function captureAndAnalyze() {
  if (!cameraStream) return;

  const w = cameraVideo.videoWidth;
  const h = cameraVideo.videoHeight;
  if (!w || !h) {
    showError("Camera not ready. Wait a moment and try again.");
    return;
  }

  captureCanvas.width = w;
  captureCanvas.height = h;
  const ctx = captureCanvas.getContext("2d");
  ctx.drawImage(cameraVideo, 0, 0, w, h);

  capturePreview.src = captureCanvas.toDataURL("image/jpeg");
  capturePreviewWrap.classList.remove("hidden");

  captureCanvas.toBlob(async (blob) => {
    if (!blob) {
      showError("Failed to capture frame.");
      return;
    }
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
    await runPrediction(file);
  }, "image/jpeg", 0.92);
}

async function runPrediction(file) {
  resultsSection.classList.remove("hidden");
  resultsSection.classList.add("loading");
  resultsError.classList.add("hidden");
  resultsSuccess.classList.add("hidden");
  probContainer.classList.add("hidden");

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(API_PREDICT, { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      showError(data.detail || "Prediction failed.");
      return;
    }

    if (!data.face_detected) {
      showError(data.message || "No face detected.");
      return;
    }

    resultsSuccess.classList.remove("hidden");
    resEmotion.textContent = data.emotion;
    resBhava.textContent = data.bhava;
    resConfidence.textContent = data.confidence_percent + "%";

    if (data.probabilities) {
      probContainer.classList.remove("hidden");
      probContainer.innerHTML = "<h3>All probabilities</h3>";
      const sorted = Object.entries(data.probabilities).sort((a, b) => b[1] - a[1]);
      sorted.forEach(([name, prob]) => {
        const pct = (prob * 100).toFixed(1);
        probContainer.innerHTML += `
          <div class="prob-bar">
            <span><span>${name}</span><span>${pct}%</span></span>
            <div class="track"><div class="fill" style="width:${pct}%"></div></div>
          </div>`;
      });
    }
  } catch (err) {
    showError("Could not reach server. Is app.py running?");
  } finally {
    resultsSection.classList.remove("loading");
  }
}

function showError(msg) {
  resultsError.textContent = msg;
  resultsError.classList.remove("hidden");
  resultsSuccess.classList.add("hidden");
  probContainer.classList.add("hidden");
}
