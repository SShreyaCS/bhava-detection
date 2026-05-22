const features = [
  {
    icon: "shield",
    title: "High Accuracy",
    sub: "Advanced AI Models",
  },
  {
    icon: "bolt",
    title: "Real-time Results",
    sub: "Instant Detection",
  },
  {
    icon: "lock",
    title: "Secure & Private",
    sub: "Your Data is Safe",
  },
  {
    icon: "lotus",
    title: "Made for Dancers",
    sub: "By Art Lovers",
  },
];

function FeatureIcon({ type }) {
  const icons = {
    shield: (
      <path d="M12 2l8 4v6c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V6l8-4z" />
    ),
    bolt: <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />,
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 018 0v3" />
      </>
    ),
    lotus: <circle cx="12" cy="12" r="5" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {icons[type]}
    </svg>
  );
}

export default function FooterFeatures() {
  return (
    <footer className="footer-features">
      {features.map((f) => (
        <div key={f.title} className="feature-item">
          <div className="feature-icon">
            <FeatureIcon type={f.icon} />
          </div>
          <div>
            <strong>{f.title}</strong>
            <span>{f.sub}</span>
          </div>
        </div>
      ))}
    </footer>
  );
}
