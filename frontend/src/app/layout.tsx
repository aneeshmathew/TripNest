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
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
