"use client";

import { useTheme } from "../context/ThemeContext";

function SettingsForm() {
  const { theme, toggleTheme } = useTheme();

  return (
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
  );
}

export default SettingsForm;
