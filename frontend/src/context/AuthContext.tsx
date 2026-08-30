"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { fetchMe, logout as logoutRequest } from "../api/auth";
import { tokenStorage } from "../api/tokenStorage";
import { ApiError } from "../api/client";
import type { AuthResponse, User } from "../types/auth";

interface AuthContextValue {
  user: User | null;
  authChecked: boolean;
  isAuthenticated: boolean;
  login: (auth: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Validate any persisted access token against the backend on first
  // client render, rather than trusting localStorage blindly — the token
  // may have expired or been revoked since the last visit. apiFetch's
  // built-in refresh-on-401 (api/client.ts) transparently handles an
  // expired-but-refreshable access token.
  useEffect(() => {
    const hasToken = Boolean(tokenStorage.getAccessToken());
    if (!hasToken) {
      setAuthChecked(true);
      return;
    }

    fetchMe()
      .then(({ user: fetchedUser }) => setUser(fetchedUser))
      .catch(() => {
        tokenStorage.clear();
        setUser(null);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const login = useCallback(({ accessToken, refreshToken, user: loggedInUser }: AuthResponse) => {
    tokenStorage.setTokens(accessToken, refreshToken);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(() => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      // Best-effort server-side revocation; don't block the UI logout on it.
      logoutRequest(refreshToken).catch((err: unknown) => {
        if (!(err instanceof ApiError)) console.error(err);
      });
    }
    tokenStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, authChecked, isAuthenticated: Boolean(user), login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
