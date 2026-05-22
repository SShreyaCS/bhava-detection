/** Live backend on Render — change this URL if your service name differs */
const API_BASE = "https://bhava-detection.onrender.com";

export async function predictImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = `Prediction failed (${response.status})`;
    try {
      const err = await response.json();
      message = err.detail || message;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message);
  }

  return response.json();
}
