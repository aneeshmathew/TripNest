import path from "path";
import type { NextConfig } from "next";

// Pins Next.js's output file tracing root explicitly to this directory.
// (Originally added to resolve a monorepo lockfile-detection ambiguity
// from before the frontend/backend split, when a parent folder's
// lockfile confused Next's auto-detection — no longer strictly required
// now that this is a standalone repo, but harmless and still correct to
// pin explicitly.)
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        // Seeded placeholder photos for data/worldDestinations.ts — see
        // that file's header comment for why these aren't real
        // per-destination Unsplash photos yet.
        protocol: "https",
        hostname: "picsum.photos"
      }
    ]
  }
};

export default nextConfig;
