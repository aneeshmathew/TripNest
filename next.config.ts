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
        // Pixabay CDN — live destination/activity photos from lib/pixabay.ts.
        // next/image fetches and re-serves these from our own domain, so the
        // browser never hotlinks Pixabay directly (their API terms forbid
        // permanent hotlinking).
        protocol: "https",
        hostname: "cdn.pixabay.com"
      },
      {
        // largeImageURL (what lib/pixabay.ts uses for hero banners) is served
        // from pixabay.com/get/..., not the cdn. subdomain. Scoped to /get/**
        // so the rest of the site isn't an allowed image source.
        protocol: "https",
        hostname: "pixabay.com",
        pathname: "/get/**"
      },
      {
        // The hand-curated fallback imageUrl values in data/*.ts are still
        // static Unsplash URLs — keep this until those are replaced.
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        // Seeded placeholder photos for data/worldDestinations.ts — see
        // that file's header comment for why these aren't real
        // per-destination photos yet.
        protocol: "https",
        hostname: "picsum.photos"
      }
    ]
  }
};

export default nextConfig;