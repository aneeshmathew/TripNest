// "Trip" and "Nest" are deliberately two different colors — a simple
// two-tone wordmark treatment. The second word uses var(--color-text)
// rather than a second hardcoded brand color, so it stays legible against
// var(--color-primary) automatically in both light and dark theme.
function BrandMark() {
  return (
    <>
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" className="brand-icon">
        <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
        <path d="M16 8 L24 15 V24 H19 V18 H13 V24 H8 V15 Z" fill="var(--color-primary-text)" />
      </svg>
      <span className="brand-text">
        <span className="brand-word-primary">Trip</span>
        <span className="brand-word-secondary">Nest</span>
      </span>
    </>
  );
}

export default BrandMark;
