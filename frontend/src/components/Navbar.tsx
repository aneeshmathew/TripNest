"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import BrandMark from "./BrandMark";
import ThemeIcon from "./ThemeIcon";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
//
// Logged-in state is a "Hello <name>" dropdown trigger (real data —
// User.name from the backend, not previously shown anywhere in the
// navbar) rather than the flat row of links it used to be. Only Settings
// and Logout are in the menu — both real, working destinations. This
// was originally asked to also include Account/Chart/Wishlist/Bookings/
// Saved Plans/Estimates/Favorites, but none of those exist as actual
// pages or features yet (no booking system, no wishlist, no saved-plans
// concept anywhere in the app — see README, Feature Gaps). Adding menu
// entries for them would mean dead links or blank pages, which the rest
// of this app deliberately avoids (see e.g. the destinations/activities
// pages' honest-empty-state pattern) — so the dropdown mechanism is built
// and ready, but only populated with what's real today.
function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

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
          <div className="account-menu" ref={menuRef}>
            <button
              type="button"
              className="account-menu-trigger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              data-testid="account-menu-trigger"
            >
              Hello {user?.name}
              <ChevronDown size={16} aria-hidden="true" />
            </button>
            {menuOpen && (
              <div className="account-menu-dropdown" role="menu" data-testid="account-menu-dropdown">
                <Link
                  href="/settings"
                  role="menuitem"
                  className="account-menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  className="account-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  data-testid="logout-btn"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
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
