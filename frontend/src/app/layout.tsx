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

// Runs before React hydrates (and before first paint), so the correct
// theme — from localStorage if the user has picked one before, light
// otherwise — applies immediately with no flash of the wrong theme. Light
// is the deliberate default regardless of OS/browser dark-mode
// preference; it only ever changes once the user actually clicks the
// toggle. Sets data-theme directly via the DOM, which is also why <html>
// below needs suppressHydrationWarning (see that comment).
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning here only covers the <html> element itself
    // (React doesn't propagate it to children) — it's needed for two
    // separate reasons, both about attributes on <html> being changed
    // client-side before React hydrates: (1) the theme-init script above
    // setting data-theme, and (2) browser extensions (password managers,
    // grammar checkers, etc.) injecting their own attributes like
    // data-lt-installed. Neither is a real hydration bug elsewhere in the
    // tree — this does NOT hide those.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
