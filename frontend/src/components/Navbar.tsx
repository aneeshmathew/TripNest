"use client";

import Link from "next/link";
import BrandMark from "./BrandMark";
import { useAuth } from "../context/AuthContext";

// "Home" was dropped as a separate link — the brand itself always links
// to "/". Remaining center links are anchors into homepage sections
// (still work from other pages via Link's default hash-navigation to
// "/#..."). Settings only shows once logged in — the settings page's
// only real content (account details) needs a signed-in user anyway, and
// the theme toggle living there isn't worth showing a link to when
// logged out (see components/SettingsForm.tsx).
function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar">
      <Link href="/" className="brand">
        <BrandMark />
      </Link>
      <nav className="nav-links">
        <Link href="/#featured-stays" className="nav-link">
          Start planning
        </Link>
        <Link href="/#testimonials" className="nav-link">
          Reviews
        </Link>
        <Link href="/#contact" className="nav-link">
          Contact
        </Link>
      </nav>
      <div className="nav-actions">
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
