export default function LotusDivider({ text }) {
  return (
    <div className="lotus-divider">
      <span className="line" />
      <span className="lotus">✦</span>
      {text && <span className="divider-text">{text}</span>}
      <span className="lotus">✦</span>
      <span className="line" />
    </div>
  );
}
