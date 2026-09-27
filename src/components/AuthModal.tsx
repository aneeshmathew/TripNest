"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useAuthModal } from "../context/AuthModalContext";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

// Rendered once in AppShell, alongside everything else — mode comes from
// AuthModalContext, so it opens no matter which page the visitor is on
// when they click Login/Sign up in the navbar. /login and /signup still
// exist as real routes for direct navigation; this is just a second way
// in that doesn't leave the current page.
function AuthModal() {
  const { mode, close, openLogin, openSignup } = useAuthModal();

  useEffect(() => {
    if (!mode) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("keydown", handleKeyDown);
    // Prevent the page behind the modal from scrolling while it's open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mode, close]);

  if (!mode) return null;

  return (
    <div
      className="auth-modal-overlay"
      // Only close on a click that starts AND ends on the overlay itself —
      // otherwise selecting text inside the form and releasing the mouse
      // outside the dialog would incorrectly close it.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      data-testid="auth-modal-overlay"
    >
      <div
        className="auth-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "Log in" : "Sign up"}
        data-testid="auth-modal"
      >
        <button
          type="button"
          className="auth-modal-close"
          onClick={close}
          aria-label="Close"
          data-testid="auth-modal-close"
        >
          <X size={18} aria-hidden="true" />
        </button>
        {mode === "login" ? (
          <LoginForm embedded onSuccess={close} onSwitchToSignup={openSignup} />
        ) : (
          <SignupForm embedded onSuccess={close} onSwitchToLogin={openLogin} />
        )}
      </div>
    </div>
  );
}

export default AuthModal;
