import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

interface TokenUser {
  id: string;
  email: string;
  role: string;
}

// Short-lived, stateless — verified purely by signature/expiry in
// auth.middleware.ts, no DB round trip needed on every request.
export function signAccessToken(user: TokenUser): string {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL
  });
}

// Refresh tokens are opaque random strings, not JWTs. We only ever need to
// look one up by its hash and check the DB row (expiry/revoked) — an
// opaque token is simpler than double-verifying JWT signature + DB state,
// and it makes revocation (logout, "log out all devices") trivial: delete
// or mark the row, and the token is dead immediately, no waiting for JWT
// expiry.
export function generateRefreshToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = crypto.randomBytes(48).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  return { token, tokenHash, expiresAt };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
