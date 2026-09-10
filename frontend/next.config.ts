import path from "path";
import type { NextConfig } from "next";

// TripNest isn't a real npm workspace — root/backend/frontend each have
// their own independent package.json + lockfile (see root package.json's
// "setup" script: three separate `npm install --prefix <dir>` calls).
// Next.js's output file tracing auto-detects a monorepo root by walking
// up for lockfiles, finds the one in the parent TripNest/ folder too, and
// isn't sure which is authoritative — hence the "inferred your workspace
// root" warning. Pinning it here to this directory (frontend/, the
// actual Next.js app root) removes the ambiguity outright rather than
// leaving Next.js to guess correctly by chance.
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
