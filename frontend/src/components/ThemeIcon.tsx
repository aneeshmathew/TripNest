interface ThemeIconProps {
  theme: "light" | "dark";
}

// Sun is deliberately hardcoded yellow, not tied to --color-primary —
// recoloring it to the brand's terracotta/rust would read as "branded
// icon," not "sun." Moon uses currentColor (inherits the button's own
// color, which follows --color-text) so it's monochrome — dark in light
// theme, light in dark theme — rather than a colored emoji glyph whose
// exact look depends on the OS's emoji font.
function ThemeIcon({ theme }: ThemeIconProps) {
  if (theme === "dark") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" fill="#f5c542" />
        <g stroke="#f5c542" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="2" x2="12" y2="4.3" />
          <line x1="12" y1="19.7" x2="12" y2="22" />
          <line x1="4.2" y1="4.2" x2="5.9" y2="5.9" />
          <line x1="18.1" y1="18.1" x2="19.8" y2="19.8" />
          <line x1="2" y1="12" x2="4.3" y2="12" />
          <line x1="19.7" y1="12" x2="22" y2="12" />
          <line x1="4.2" y1="19.8" x2="5.9" y2="18.1" />
          <line x1="18.1" y1="5.9" x2="19.8" y2="4.2" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M20.7 14.6A8.5 8.5 0 0 1 9.4 3.3a8.5 8.5 0 1 0 11.3 11.3Z" />
    </svg>
  );
}

export default ThemeIcon;
