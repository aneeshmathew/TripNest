"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "../context/AuthContext";
import { AuthModalProvider } from "../context/AuthModalContext";
import { ThemeProvider } from "../context/ThemeContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TripIllustrationBanner from "./TripIllustrationBanner";
import TravelWatermark from "./TravelWatermark";
import AuthModal from "./AuthModal";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The marketing homepage Hero (see Hero.tsx) is a full-bleed photo
  // section starting at the very top of the viewport — the dark navbar
  // backdrop bar and the illustration banner above the footer are styled
  // for the app's normal (non-hero) pages and would clash on top of the
  // hero photo, so they're skipped on "/". The watermark is NOT skipped
  // here (per request, it should show on the homepage too) — it's
  // fixed-to-viewport and z-index: 0 (see TravelWatermark.tsx's own
  // comment), so it just shows through wherever the page doesn't paint
  // over it, same as any other page; it never actually clashed with the
  // hero photo the way the other two would have.
  // Note: "/" also has a second state — search results, when a filter
  // query param is present (see app/page.tsx's hasActiveFilters) — which
  // is normal content, not the hero. Root layout/AppShell has no access
  // to that page-level state without opting the whole app out of static
  // rendering (useSearchParams here would do that), so that branch of
  // page.tsx instead renders its own local backdrop bar + top padding to
  // stay legible under this still-transparent-styled navbar. See that
  // file's SearchResultsIntro/wrapper for the other half of this.
  const isHome = pathname === "/";

  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthModalProvider>
          <div className="app">
            {!isHome && <div className="app-background-graphic" aria-hidden="true" />}
            <TravelWatermark />
            <Navbar />
            <main className={isHome ? "container container-flush" : "container"}>{children}</main>
            {!isHome && <TripIllustrationBanner />}
            <Footer />
          </div>
          <AuthModal />
        </AuthModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
