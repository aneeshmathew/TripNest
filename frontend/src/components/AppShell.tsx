"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";
import { AuthModalProvider } from "../context/AuthModalContext";
import { ThemeProvider } from "../context/ThemeContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TripIllustrationBanner from "./TripIllustrationBanner";
import TravelWatermark from "./TravelWatermark";
import AuthModal from "./AuthModal";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthModalProvider>
          <div className="app">
            <div className="app-background-graphic" aria-hidden="true" />
             <TravelWatermark />
            <Navbar />
            <main className="container">{children}</main>
            <TripIllustrationBanner />
            <Footer />
          </div>
          <AuthModal />
        </AuthModalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
