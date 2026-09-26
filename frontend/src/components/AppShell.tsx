"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "../context/AuthContext";
import { AuthModalProvider } from "../context/AuthModalContext";
import { ThemeProvider } from "../context/ThemeContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthModal from "./AuthModal";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
 
  const isHome = pathname === "/";

  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthModalProvider>
          <div className="app">
            {!isHome && <div className="app-background-graphic" aria-hidden="true" />}
            <Navbar />
            <main className={isHome ? "container container-flush" : "container"}>{children}</main>
            <Footer />
          </div>
          <AuthModal />
        </AuthModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}