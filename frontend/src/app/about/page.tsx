import Link from "next/link";
import type { Metadata } from "next";
import BackButton from "../../components/BackButton";

export const metadata: Metadata = {
  title: "About Us",
  description: "About Us on TripNest."
};

// Real route now exists so the footer's About Us link isn't a dead end —
// but there's no real About Us content yet, so this is an honest "coming
// soon" placeholder rather than fabricated copy (same approach as the
// rest of the site: an empty/pending state instead of fake content).
export default function AboutUsPage() {
  return (
    <section className="details static-page">
      <BackButton />
      <h1 className="page-title">About Us</h1>
      <p className="subtitle">This page is coming soon — check back shortly.</p>
      <Link href="/" className="details-link">
        Back to home
      </Link>
    </section>
  );
}
