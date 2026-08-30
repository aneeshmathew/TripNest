"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useSort } from "../context/SortContext";

function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { openModal } = useSort();
  const showSortButton = pathname === "/";

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
        {showSortButton && (
          <button type="button" className="sort-btn" onClick={openModal} data-testid="sort-trigger-btn">
            Sort
          </button>
        )}
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
