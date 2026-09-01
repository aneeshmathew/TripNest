"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import Navbar from "./Navbar";
import Footer from "./Footer";

// This is the one client-side boundary for the whole app: auth state,
// theme state, and the navbar live here. `children` is whatever Server
// Component the current route rendered (app/page.tsx,
// app/apartments/[id]/page.tsx, etc.) — Next.js keeps that server-rendered
// output intact even though it's passed through a client component
// boundary, so listing content still ships in the initial HTML for SEO.
//
// `.container` here caps width/adds padding for every page (login,
// settings, apartment detail, and the non-hero parts of home). The Hero
// component breaks back out to full viewport width via a CSS full-bleed
// trick (see .hero in globals.css) rather than restructuring this shell
// per-route.
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="container">{children}</main>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
