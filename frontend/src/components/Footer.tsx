"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import BrandMark from "./BrandMark";

// Company/Support links below are decorative placeholders, not real
// routes — TripNest has no /about, /careers, /blog, /press, /help-center,
// /safety, /terms-of-service or /privacy-policy pages today, so these are
// rendered as inert text (same "don't fake it" approach as the social
// icons) rather than links to pages that don't exist. Real functional
// links (Browse stays, Reviews, Settings, Log in) that used to live here
// still work via the navbar / homepage; only their footer shortcut is
// gone now that this column layout matches the design reference.
const COMPANY_LINKS = ["About Us", "Careers", "Blog", "Press"];
const SUPPORT_LINKS = ["Help Center", "Safety", "Terms of Service", "Privacy Policy"];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-columns">
        <div className="footer-column footer-column-brand">
          <Link href="/" className="brand footer-brand">
            <BrandMark />
          </Link>
          <p className="footer-tagline">Better trips. Happier you.</p>
          <div className="footer-social" aria-hidden="true">
            <span className="footer-social-icon">
              <Instagram size={16} />
            </span>
            <span className="footer-social-icon">
              <Facebook size={16} />
            </span>
            <span className="footer-social-icon">
              <Twitter size={16} />
            </span>
            <span className="footer-social-icon">
              <Linkedin size={16} />
            </span>
            <span className="footer-social-icon">
              <Youtube size={16} />
            </span>
          </div>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">Company</h3>
          <ul className="footer-links footer-links-placeholder" aria-disabled="true">
            {COMPANY_LINKS.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">Support</h3>
          <ul className="footer-links footer-links-placeholder" aria-disabled="true">
            {SUPPORT_LINKS.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">Get travel inspiration</h3>
          <p className="footer-newsletter-copy">
            Join our newsletter for the latest deals, travel tips and more.
          </p>
          {/* No real newsletter/subscription endpoint exists yet — submit
              is a no-op rather than pretending to sign the visitor up. */}
          <form className="footer-newsletter-form" onSubmit={(event) => event.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
              className="footer-newsletter-input"
            />
            <button type="submit" className="footer-newsletter-submit" aria-label="Subscribe">
              &rarr;
            </button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} TripNest. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
