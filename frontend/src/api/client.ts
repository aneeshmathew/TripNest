import { tokenStorage } from "./tokenStorage";
import type { AuthResponse } from "../types/auth";

// This client is used from client components only (auth calls, which need
// localStorage). Listing data is fetched server-side instead — see
// src/lib/listings.ts — so it can be SSR'd/statically generated for SEO.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean; // attach the access token; defaults to true
  skipRefresh?: boolean; // used internally to avoid infinite refresh loops
}

async function parseBody(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    tokenStorage.clear();
    return false;
  }

  const data = (await response.json()) as AuthResponse;
  tokenStorage.setTokens(data.accessToken, data.refreshToken);
  return true;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, skipRefresh = false, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers
  };

  if (auth) {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      (finalHeaders as Record<string, string>).Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: finalHeaders });

  if (response.status === 401 && auth && !skipRefresh) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, skipRefresh: true });
    }
  }

  const body = await parseBody(response);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : "Request failed";
    throw new ApiError(response.status, message);
  }

  return body as T;
}
