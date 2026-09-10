"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  /** Where to send the visitor if there's no in-app history to go back to. */
  fallbackHref?: string;
  label?: string;
}

// Detail pages (apartments/[id], activities/[slug], destinations/[slug])
// previously had no way back except the TripNest logo, which always goes
// to "/" regardless of where the visitor actually came from — a search
// results page, the homepage carousel, another destination's listing,
// etc. This uses the browser's own history so "back" means back to
// wherever they actually were.
//
// window.history.length > 1 is checked client-side only (it needs
// `window`, so it can't run during SSR) and errs toward showing the
// working "go back" action; it isn't a perfect signal for whether that
// history is actually inside this app, but a real Link fallback covers
// the case where there's clearly no history to pop (a page opened
// directly from a shared link or a new tab).
export default function BackButton({ fallbackHref = "/", label = "Back" }: BackButtonProps) {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    setHasHistory(window.history.length > 1);
  }, []);

  if (hasHistory) {
    return (
      <button type="button" className="back-button" onClick={() => router.back()}>
        <ChevronLeft size={18} aria-hidden="true" />
        {label}
      </button>
    );
  }

  return (
    <Link href={fallbackHref} className="back-button">
      <ChevronLeft size={18} aria-hidden="true" />
      {label}
    </Link>
  );
}
