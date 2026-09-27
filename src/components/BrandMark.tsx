// "Trip" and "Nest" are deliberately two different colors — a simple
// two-tone wordmark treatment. The second word uses var(--color-text)
// rather than a second hardcoded brand color, so it stays legible against
// var(--color-primary) automatically in both light and dark theme.
// Exception: inside the navbar and the footer, globals.css pins both
// words (and the icon's fill colors) to fixed values instead — both
// surfaces have their own fixed background (a photo/background graphic
// for the navbar, a fixed navy for the footer) rather than a normal
// theme-following surface, so the logo shouldn't visibly change, and in
// the footer's case a theme-following --color-text would otherwise nearly
// disappear against the fixed dark background in light theme.
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
