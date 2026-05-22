import Header from "./Header";
import MandalaBackground from "./MandalaBackground";

export default function Layout({
  children,
  showBack = false,
  showAbout = true,
  className = "",
}) {
  return (
    <div className={`page ${className}`}>
      <MandalaBackground />
      <Header showBack={showBack} showAbout={showAbout} />
      <main className="page-content">{children}</main>
    </div>
  );
}
