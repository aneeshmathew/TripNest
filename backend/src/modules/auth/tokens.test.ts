import { describe, expect, it } from "vitest";
import { generateRefreshToken, hashToken } from "./tokens.js";

describe("generateRefreshToken", () => {
  it("produces a random hex token whose hash matches the stored tokenHash", () => {
    const { token, tokenHash, expiresAt } = generateRefreshToken();

    expect(token).toMatch(/^[0-9a-f]{96}$/);
    expect(tokenHash).not.toBe(token);
    expect(tokenHash).toBe(hashToken(token));
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("generates a different token on every call", () => {
    const first = generateRefreshToken();
    const second = generateRefreshToken();

    expect(first.token).not.toBe(second.token);
  });
});

describe("hashToken", () => {
  it("is deterministic for the same input", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
  });

  it("produces different hashes for different inputs", () => {
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
  });
});
