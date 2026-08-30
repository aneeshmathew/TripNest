"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="navbar">
      <Link href="/" className="brand">
        TripNest
      </Link>
      <nav className="nav-links">
        <Link href="/">Home</Link>
        {!isAuthenticated && <Link href="/login">Login</Link>}
      </nav>
      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            <span className="user-email">{user?.email}</span>
            <button type="button" className="secondary-btn" onClick={logout} data-testid="logout-btn">
              Logout
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}

export default Navbar;
