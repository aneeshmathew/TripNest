"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import BrandMark from "./BrandMark";

// Real routes now exist for each of these (see app/about, app/careers,
// etc.) — pages are honest "coming soon" placeholders since there's no
// real content yet, but the footer links themselves are live rather
// than the earlier inert-text placeholders.
const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Blog", href: "/blog" },
  { label: "Press", href: "/press" }
];
const SUPPORT_LINKS = [
  { label: "Help Center", href: "/help-center" },
  { label: "Safety", href: "/safety" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Privacy Policy", href: "/privacy-policy" }
];

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-illustration-strip" aria-hidden="true" />
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
          <ul className="footer-links">
            {COMPANY_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">Support</h3>
          <ul className="footer-links">
            {SUPPORT_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link href={href}>{label}</Link>
              </li>
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
