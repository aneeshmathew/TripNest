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
  // section starting at the very top of the viewport — the decorative
  // watermark, the dark navbar backdrop bar, and the illustration banner
  // above the footer are all styled for the app's normal (non-hero) pages
  // and would clash on top of the hero photo, so they're skipped on "/".
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
            {!isHome && <TravelWatermark />}
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
