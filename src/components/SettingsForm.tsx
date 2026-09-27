"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function SettingsForm() {
  const { user, isAuthenticated, authChecked } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Wait for the client-side auth check (validating any persisted token
  // against the backend — see AuthContext) before deciding what to show,
  // so a logged-in user doesn't briefly flash a "log in" prompt on
  // reload.
  if (!authChecked) {
    return <p className="status-text">Loading...</p>;
  }

  if (!isAuthenticated) {
    return (
      <section className="settings-section">
        <p className="status-text">
          <Link href="/login" className="details-link">
            Log in
          </Link>{" "}
          to view your account and settings.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="settings-section">
        <h2 className="settings-row-title">Account</h2>
        <div className="settings-row">
          <div>
            <p className="settings-row-label">Name</p>
            <p className="settings-row-description">{user?.name}</p>
          </div>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-row-label">Email</p>
            <p className="settings-row-description">{user?.email}</p>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-row-title">Appearance</h2>
        <div className="settings-row">
          <div>
            <p className="settings-row-label">Theme</p>
            <p className="settings-row-description">
              Currently using {theme === "dark" ? "dark" : "light"} theme.
            </p>
          </div>
          <button
            type="button"
            className="secondary-btn"
            onClick={toggleTheme}
            data-testid="theme-toggle-btn"
          >
            Switch to {theme === "dark" ? "light" : "dark"}
          </button>
        </div>
      </section>
    </>
  );
}

export default SettingsForm;
