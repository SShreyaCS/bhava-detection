const API_BASE = import.meta.env.VITE_API_URL || "";

export async function predictImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Prediction failed");
  }
  return data;
}
