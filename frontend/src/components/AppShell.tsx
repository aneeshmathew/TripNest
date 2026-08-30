"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";
import { SortProvider } from "../context/SortContext";
import Navbar from "./Navbar";
import SortModal from "./SortModal";

// This is the one client-side boundary for the whole app: everything
// interactive (auth state, sort state, the navbar, the sort modal) lives
// here. `children` is whatever Server Component the current route
// rendered (app/page.tsx, app/apartments/[id]/page.tsx, etc.) — Next.js
// keeps that server-rendered output intact even though it's passed
// through a client component boundary, so listing content still ships in
// the initial HTML for SEO.
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SortProvider>
        <div className="app">
          <Navbar />
          <main className="container">{children}</main>
          <SortModal />
        </div>
      </SortProvider>
    </AuthProvider>
  );
}
