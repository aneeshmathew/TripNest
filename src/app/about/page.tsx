import Link from "next/link";
import type { Metadata } from "next";
import BackButton from "../../components/BackButton";

export const metadata: Metadata = {
  title: "About Us",
  description: "About TripNest — our mission, what we offer, and how we support travelers."
};

export default function AboutUsPage() {
  return (
    <section className="details static-page">
      <BackButton />
      <h1 className="page-title">About Us</h1>
      <p className="subtitle">Better trips. Happier you.</p>

      <h2>Our Mission</h2>
      <p>
        TripNest exists to make planning a trip feel as good as taking one. Instead of juggling a dozen
        tabs for flights, stays, and things to do, we bring destinations, apartments, hotels,
        restaurants, and activities together in one place — so you can spend less time researching and
        more time actually looking forward to your trip.
      </p>

      <h2>What We Offer</h2>
      <p>
        Every destination on TripNest comes with curated apartment and hotel listings, restaurant
        picks, and things to do, backed by real guest reviews rather than generic marketing copy. We
        supplement our own listings with live, up-to-date places nearby, so you're never stuck with a
        thin or outdated list — and we keep adding more destinations, across every continent, as we
        grow.
      </p>

      <h2>Customer Care</h2>
      <p>
        We know a trip is only as good as the support behind it. Our customer service team is here to
        help before you book, while you're traveling, and after you're home — whether that's answering
        a quick question about a listing or helping sort out something that didn't go as planned.
      </p>

      <h2>Our Promise</h2>
      <p>
        We're a small, growing team, and we're building TripNest the way we'd want to use it ourselves:
        honest listings, real reviews, and a platform that keeps getting better as more travelers join
        us. Thanks for being part of that.
      </p>

      <Link href="/" className="details-link">
        Back to home
      </Link>
    </section>
  );
}
