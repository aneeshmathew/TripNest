"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type AuthModalMode = "login" | "signup" | null;

interface AuthModalContextValue {
  mode: AuthModalMode;
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | undefined>(undefined);

// Sits alongside AuthProvider in AppShell — separate from auth state
// itself (isAuthenticated etc.) since this only tracks which popup, if
// any, is open. /login and /signup still exist as real routes (direct
// links, no-JS, deep links keep working) — this just gives the navbar a
// closable-popup alternative that doesn't navigate away from the page the
// visitor was on.
export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthModalMode>(null);

  const openLogin = useCallback(() => setMode("login"), []);
  const openSignup = useCallback(() => setMode("signup"), []);
  const close = useCallback(() => setMode(null), []);

  return (
    <AuthModalContext.Provider value={{ mode, openLogin, openSignup, close }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return ctx;
}
