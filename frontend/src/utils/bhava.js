const EMOTION_LABELS = {
  happy: "Joy",
  sad: "Sorrow",
  angry: "Anger",
  anger: "Anger",
  fear: "Fear",
  disgust: "Disgust",
  surprise: "Wonder",
  neutral: "Peace",
  contempt: "Disgust",
};

export function formatBhava(bhava, emotion) {
  if (!bhava) return "—";
  const label = EMOTION_LABELS[emotion] || emotion;
  return `${bhava} (${label})`;
}

export function getFeedback(emotion, bhava, confidence) {
  const pct = confidence ? Math.round(confidence * 100) : 0;
  const messages = {
    happy: `Your expression radiates warmth and joy. ${bhava} beautifully reflects the playful spirit of classical performance.`,
    sad: `A gentle melancholy comes through in your expression. ${bhava} captures the depth of Karuna with grace.`,
    angry: `Strong intensity is visible in your features. ${bhava} channels the dramatic power of Raudra.`,
    fear: `Your expression conveys vulnerability and tension. ${bhava} aligns with the essence of Bhayanaka.`,
    disgust: `A distinct aversion is readable in your expression. ${bhava} reflects Bibhatsa with clarity.`,
    surprise: `Wide-eyed wonder shines through. ${bhava} embodies the marvel of Adbhuta.`,
    neutral: `A calm, balanced expression is present. ${bhava} reflects the serenity of Shanta.`,
  };
  const body =
    messages[emotion] ||
    `Your expression has been analyzed. ${bhava} is the dominant bhava detected.`;

  const improvement =
    pct >= 90
      ? "Maintain steady lighting and hold the expression a moment longer for even stronger dramatic impact."
      : "Try facing the camera directly with even lighting; slightly exaggerate the expression around the eyes and jaw for clearer Rasa alignment.";

  return { body, improvement };
}
