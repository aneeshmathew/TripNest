import Link from "next/link";
import type { Metadata } from "next";
import BackButton from "../../components/BackButton";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "TripNest's Privacy Policy."
};

// Generic, original boilerplate covering the standard sections a
// consumer travel platform's privacy policy would include. Not copied
// from any real company's policy — placeholder legal content until this
// is reviewed by an actual lawyer before any real launch.
export default function PrivacyPolicyPage() {
  return (
    <section className="details static-page">
      <BackButton />
      <h1 className="page-title">Privacy Policy</h1>
      <p className="subtitle">Last updated: September 2026</p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect information you give us directly, like your name and email when you create an
        account, and content you post, like reviews and photos. We also collect information
        automatically, such as your general location (to show relevant destinations) and how you use
        the platform.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>
        We use your information to operate TripNest — creating your account, showing relevant listings,
        processing bookings, and displaying your reviews. We also use it to improve the platform, keep
        it secure, and communicate with you about your account or, if you've opted in, our newsletter.
      </p>

      <h2>3. Cookies and Similar Technologies</h2>
      <p>
        TripNest uses cookies and similar technologies to keep you signed in, remember your preferences,
        and understand how the platform is used. You can control cookies through your browser settings,
        though some features may not work properly without them.
      </p>

      <h2>4. Third-Party Services</h2>
      <p>
        We work with third-party services to power parts of TripNest — for example, location and
        places data to help you find nearby hotels, apartments, and restaurants, and image services for
        destination photos. These providers only receive the information needed to perform their
        specific function.
      </p>

      <h2>5. Data Retention and Security</h2>
      <p>
        We keep your information for as long as your account is active or as needed to provide the
        service. We use reasonable technical and organizational measures to protect your data, but no
        method of transmission or storage is completely secure.
      </p>

      <h2>6. Your Rights and Choices</h2>
      <p>
        You can access, update, or delete much of your information directly from your account settings.
        You can unsubscribe from marketing emails at any time using the link in those emails. Depending
        on where you live, you may have additional rights over your personal data.
      </p>

      <h2>7. Children's Privacy</h2>
      <p>
        TripNest is not directed at children, and we don't knowingly collect personal information from
        children under 13 (or the relevant age of consent in your region).
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. If we make material changes, we'll post the
        updated policy here with a new "last updated" date.
      </p>

      <h2>9. Contact Us</h2>
      <p>Questions about this policy or your data? Reach out to our support team any time.</p>

      <Link href="/" className="details-link">
        Back to home
      </Link>
    </section>
  );
}
