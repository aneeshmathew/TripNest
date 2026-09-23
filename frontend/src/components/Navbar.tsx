"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import BrandMark from "./BrandMark";
import ThemeIcon from "./ThemeIcon";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";
import { useTheme } from "../context/ThemeContext";
function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { openLogin, openSignup } = useAuthModal();
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
            <button
              type="button"
              className="nav-link"
              onClick={openLogin}
              data-testid="login-nav-btn"
            >
              Login
            </button>
            <button
              type="button"
              className="primary-btn nav-cta"
              onClick={openSignup}
              data-testid="signup-nav-btn"
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
