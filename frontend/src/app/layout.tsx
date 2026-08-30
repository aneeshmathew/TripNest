import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppShell from "../components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TripNest | Discover great places to stay",
    template: "%s | TripNest"
  },
  description:
    "Browse handpicked apartments and vacation rentals, compare prices and ratings, and find your next stay on TripNest."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning here only covers the <html> element itself
    // (React doesn't propagate it to children) — it's the standard fix for
    // browser extensions (password managers, grammar checkers, etc.) that
    // inject attributes like data-lt-installed onto <html> before React
    // hydrates, which otherwise trips a false-positive hydration mismatch.
    // It does NOT hide real hydration bugs elsewhere in the tree.
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
