import { apiFetch } from "./client";
import type { AuthResponse, User } from "../types/auth";

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password })
  });
}

export function signup(email: string, password: string, name: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/signup", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password, name })
  });
}

export function logout(refreshToken: string): Promise<void> {
  return apiFetch<void>("/api/auth/logout", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ refreshToken })
  });
}

export function fetchMe(): Promise<{ user: User }> {
  return apiFetch<{ user: User }>("/api/auth/me");
}
