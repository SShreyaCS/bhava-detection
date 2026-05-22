"""
Emotion detection API (FastAPI) — same logic as Colab notebook.

Pipeline: Haar face detection → crop face → 224x224 → MobileNetV2 → emotion + bhava.

Run:
    python app.py

UI: http://127.0.0.1:5000/  ·  Docs: http://127.0.0.1:5000/docs
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path

import cv2
import numpy as np
import tensorflow as tf
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.models import load_model as keras_load_model

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
MODEL_PATH = BASE_DIR / "model" / "emotion_mobilenetv2.h5"
CLASS_NAMES_PATH = BASE_DIR / "model" / "class_names.txt"

IMG_SIZE = 224

# ============================================================
# BHAVA MAPPING (Natyashastra)
# ============================================================

EMOTION_TO_BHAVA = {
    "happy": "Hasya",
    "sad": "Karuna",
    "angry": "Raudra",
    "anger": "Raudra",
    "fear": "Bhayanaka",
    "disgust": "Bibhatsa",
    "surprise": "Adbhuta",
    "neutral": "Shanta",
    "contempt": "Bibhatsa",
}

model: tf.keras.Model | None = None
class_names: list[str] = []
face_cascade: cv2.CascadeClassifier | None = None


def load_class_names() -> list[str]:
    with open(CLASS_NAMES_PATH, encoding="utf-8") as f:
        return [line.strip() for line in f.readlines() if line.strip()]


def load_face_detector() -> cv2.CascadeClassifier:
    cascade_path = (
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    detector = cv2.CascadeClassifier(cascade_path)
    if detector.empty():
        raise RuntimeError(f"Failed to load face cascade from {cascade_path}")
    return detector


def load_model() -> tf.keras.Model:
    global model, class_names

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

    model = keras_load_model(str(MODEL_PATH))
    class_names = load_class_names()

    if model.output_shape[-1] != len(class_names):
        raise ValueError(
            f"Model outputs {model.output_shape[-1]} classes but "
            f"class_names.txt has {len(class_names)} entries."
        )

    print("Loaded classes:", class_names)
    return model


def _predict_from_face_rgb(face_rgb: np.ndarray) -> dict:
    """Run model on a cropped RGB face (already detected)."""
    face = cv2.resize(face_rgb, (IMG_SIZE, IMG_SIZE))
    img_array = np.array(face, dtype=np.float32)
    img_array = preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)

    prediction = model.predict(img_array, verbose=0)
    predicted_index = int(np.argmax(prediction))
    emotion = class_names[predicted_index]
    confidence = float(np.max(prediction))
    bhava = EMOTION_TO_BHAVA.get(emotion, "Unknown")

    return {
        "emotion": emotion,
        "bhava": bhava,
        "confidence": confidence,
        "confidence_percent": round(confidence * 100, 2),
        "probabilities": {
            name: float(prob)
            for name, prob in zip(class_names, prediction[0])
        },
    }


def predict_emotion(image_path: str) -> dict:
    """
    Predict emotion from an image file path (Colab-style logic).

    Detects the first face, crops it, runs MobileNetV2, returns emotion + bhava.
    """
    if model is None or face_cascade is None:
        raise RuntimeError("Model or face detector not loaded.")

    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image: {image_path}")

    return predict_emotion_from_bgr(image)


def predict_emotion_from_bgr(image_bgr: np.ndarray) -> dict:
    """Predict from a BGR numpy image (OpenCV format)."""
    if model is None or face_cascade is None:
        raise RuntimeError("Model or face detector not loaded.")

    rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(50, 50),
    )

    if len(faces) == 0:
        return {
            "face_detected": False,
            "message": "No face detected",
            "emotion": None,
            "bhava": None,
            "confidence": None,
            "confidence_percent": None,
            "probabilities": None,
            "bbox": None,
        }

    x, y, w, h = faces[0]
    face = rgb[y : y + h, x : x + w]

    result = _predict_from_face_rgb(face)
    result["face_detected"] = True
    result["bbox"] = {"x": int(x), "y": int(y), "w": int(w), "h": int(h)}
    return result


def predict_emotion_from_bytes(image_bytes: bytes) -> dict:
    """Decode uploaded image bytes and run prediction."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image_bgr is None:
        raise ValueError("Could not decode image.")
    return predict_emotion_from_bgr(image_bgr)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global face_cascade
    print(f"Loading model from {MODEL_PATH}...")
    load_model()
    face_cascade = load_face_detector()
    print("Face detector loaded.")
    yield


app = FastAPI(
    title="NrityaAI — Emotion Detection API",
    description=(
        "**Web UI (upload + live camera):** open http://127.0.0.1:5000/ in your browser.\n\n"
        "This Swagger page (`/docs`) only lists REST endpoints. "
        "Live camera runs in the browser; captured frames are sent to `POST /predict` "
        "the same way as uploaded images."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

_default_origins = (
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:3000,http://127.0.0.1:3000"
)
_allowed_origins = [
    o.strip()
    for o in os.environ.get("ALLOWED_ORIGINS", _default_origins).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


def _serve_ui():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/", include_in_schema=False)
def serve_ui_root():
    """Web UI: Upload Image + Live Detection tabs."""
    return _serve_ui()


@app.get("/ui", include_in_schema=False)
def serve_ui():
    """Same web UI as `/` — use this if you want a clear UI URL."""
    return _serve_ui()


@app.get("/api")
def api_info():
    return {
        "message": "Emotion detection API",
        "web_ui": {
            "url": "/",
            "features": ["Upload Image", "Live Detection (camera capture)"],
            "note": "Open / in a browser — not shown in /docs Swagger UI",
        },
        "docs": "/docs",
        "endpoints": {
            "GET /health": "Check server and model status",
            "POST /predict": "Image file (upload OR camera capture from web UI)",
        },
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "classes": class_names,
        "bhava_mapping": EMOTION_TO_BHAVA,
    }


@app.post("/predict")
async def predict(
    image: UploadFile = File(..., description="Image with a visible face"),
):
    """
    Predict emotion + bhava from an image file.

    Used by:
    - **Upload Image** tab on the web UI (`/`)
    - **Live Detection** tab (browser captures a frame, then POSTs here)

    Same endpoint for both — no separate live API route.

    Example:
        curl -X POST -F "image=@face.jpg" http://127.0.0.1:5000/predict
    """
    if not image.filename:
        raise HTTPException(status_code=400, detail="Empty filename.")

    try:
        contents = await image.read()
        return predict_emotion_from_bytes(contents)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
