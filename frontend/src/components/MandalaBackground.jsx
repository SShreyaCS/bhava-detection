/** Page background decor — top + corner semi-circular mandalas */
export default function MandalaBackground() {
  return (
    <div className="mandala-bg" aria-hidden="true">
      <div className="top-decor" />
      <div className="side-decor side-decor-left" />
      <div className="side-decor side-decor-right" />
    </div>
  );
}
