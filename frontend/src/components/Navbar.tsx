"use client";

import Link from "next/link";
import BrandMark from "./BrandMark";
import ThemeIcon from "./ThemeIcon";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// "Home" was dropped as a separate link — the brand itself always links
// to "/". The center nav-links (Start planning/Reviews/Contact) were
// removed by request — Reviews now lives as a link in the footer's About
// column (see Footer.tsx) and Contact was already duplicated there (the
// footer's "Get in touch" column has had id="contact" since it was
// built) - the navbar versions were redundant, not the only way to reach
// either. Settings only shows once logged in — the settings page's other
// real content (account details) needs a signed-in user anyway. The
// theme toggle is duplicated here (icon-only, always visible) AND on
// /settings (SettingsForm, with a full label) — same ThemeContext either
// way, just a quicker path to it for anyone who doesn't want to log in
// first. Testid is prefixed "navbar-" specifically so it can't collide
// with SettingsForm's own theme-toggle-btn when both are mounted at once
// (e.g. an authenticated user on /settings).
function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <Link href="/" className="brand">
        <BrandMark />
      </Link>
      <div className="nav-actions">
        <button
          type="button"
          className="theme-toggle-icon-btn"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          data-testid="navbar-theme-toggle-btn"
        >
          <ThemeIcon theme={theme} />
        </button>
        {isAuthenticated ? (
          <>
            <Link href="/settings" className="nav-link">
              Settings
            </Link>
            <span className="user-email">{user?.email}</span>
            <button type="button" className="secondary-btn" onClick={logout} data-testid="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-link">
              Login
            </Link>
            <Link href="/signup" className="primary-btn nav-cta" data-testid="signup-nav-link">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
