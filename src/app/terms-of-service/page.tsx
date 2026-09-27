import Link from "next/link";
import type { Metadata } from "next";
import BackButton from "../../components/BackButton";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "TripNest's Terms of Service."
};

// Generic, original boilerplate covering the standard sections a
// consumer travel-booking platform's ToS would include. Not copied from
// any real company's terms — placeholder legal content until this is
// reviewed by an actual lawyer before any real launch.
export default function TermsOfServicePage() {
  return (
    <section className="details static-page">
      <BackButton />
      <h1 className="page-title">Terms of Service</h1>
      <p className="subtitle">Last updated: September 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account or using TripNest, you agree to these Terms of Service. If you don't
        agree with any part of these terms, please don't use the platform.
      </p>

      <h2>2. Using TripNest</h2>
      <p>
        You may use TripNest to browse destinations, apartments, hotels, restaurants, and activities,
        and to book listings where booking is available. You agree to provide accurate information when
        creating an account and to keep your login credentials secure. You're responsible for all
        activity that happens under your account.
      </p>

      <h2>3. Bookings and Payments</h2>
      <p>
        Prices, availability, and cancellation policies are set by the individual listing and may change
        without notice. Once a booking is confirmed, its cancellation and refund terms are governed by
        the policy shown at the time of booking. TripNest is not responsible for the condition,
        accuracy, or conduct of third-party listings, hosts, or venues.
      </p>

      <h2>4. Reviews and User Content</h2>
      <p>
        When you submit a review, photo, or other content, you confirm it reflects your genuine
        experience and that you have the right to share it. We may remove content that's fraudulent,
        abusive, or violates these terms. You retain ownership of what you post, but you grant TripNest
        a license to display it on the platform.
      </p>

      <h2>5. Prohibited Conduct</h2>
      <p>
        You agree not to misuse TripNest — including submitting false reviews, attempting to access
        other users' accounts, scraping the platform without permission, or using the service for any
        unlawful purpose.
      </p>

      <h2>6. Disclaimers and Limitation of Liability</h2>
      <p>
        TripNest is provided "as is." We do our best to keep listings accurate and up to date, but we
        don't guarantee the accuracy, availability, or quality of any listing. To the fullest extent
        permitted by law, TripNest isn't liable for indirect, incidental, or consequential damages
        arising from your use of the platform.
      </p>

      <h2>7. Changes to These Terms</h2>
      <p>
        We may update these terms from time to time. If we make material changes, we'll post the
        updated terms here with a new "last updated" date. Continuing to use TripNest after changes take
        effect means you accept the revised terms.
      </p>

      <h2>8. Contact Us</h2>
      <p>Questions about these terms? Reach out to our support team any time.</p>

      <Link href="/" className="details-link">
        Back to home
      </Link>
    </section>
  );
}
