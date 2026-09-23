// "Trip" and "Nest" are deliberately two different colors — a simple
// two-tone wordmark treatment. The second word uses var(--color-text)
// rather than a second hardcoded brand color, so it stays legible against
// var(--color-primary) automatically in both light and dark theme.
// Exception: inside the navbar, globals.css pins both words (and the
// icon's fill colors) to fixed values instead — the logo shouldn't
// visibly change when the visitor toggles theme, and the navbar always
// sits over a photo/background graphic rather than a normal surface, so a
// fixed color is safe there. Elsewhere (e.g. the footer), BrandMark keeps
// following the theme, since it's on a normal, theme-following surface.
function BrandMark() {
  return (
    <>
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" className="brand-icon">
        <rect width="32" height="32" rx="9" fill="var(--color-primary)" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 7L25 15.5H23V25H9V15.5H7L16 7Z M13.5 25V19H18.5V25H13.5Z"
          fill="var(--color-primary-text)"
        />
      </svg>
      <span className="brand-text">
        <span className="brand-word-primary">Trip</span>
        <span className="brand-word-secondary">Nest</span>
      </span>
    </>
  );
}

export default BrandMark;
