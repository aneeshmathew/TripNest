import { Link, useLocation } from "react-router-dom";

interface NavbarProps {
  onOpenSort: () => void;
  isAuthenticated: boolean;
  userEmail?: string;
  onLogout: () => void;
}

function Navbar({ onOpenSort, isAuthenticated, userEmail, onLogout }: NavbarProps) {
  const location = useLocation();
  const showSortButton = isAuthenticated && location.pathname === "/";

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        TripNest
      </Link>
      <nav className="nav-links">
        {isAuthenticated ? <Link to="/">Home</Link> : <Link to="/login">Login</Link>}
      </nav>
      <div className="nav-actions">
        {showSortButton && (
          <button type="button" className="sort-btn" onClick={onOpenSort} data-testid="sort-trigger-btn">
            Sort
          </button>
        )}
        {isAuthenticated ? (
          <>
            <span className="user-email">{userEmail}</span>
            <button type="button" className="secondary-btn" onClick={onLogout} data-testid="logout-btn">
              Logout
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}

export default Navbar;
