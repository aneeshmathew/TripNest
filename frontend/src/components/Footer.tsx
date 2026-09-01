import Link from "next/link";
import BrandMark from "./BrandMark";

// Social links are decorative placeholders (no real social presence
// exists yet) — marked aria-hidden and non-navigating rather than linking
// to nowhere. Contact email is a placeholder pending a real support inbox.
function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-columns">
        <div className="footer-column">
          <Link href="/" className="brand footer-brand">
            <BrandMark />
          </Link>
          <p className="footer-tagline">Real places, real reviews.</p>
        </div>

        <div className="footer-column" id="contact">
          <h3 className="footer-heading">Get in touch</h3>
          <p>support@tripnest.example</p>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">About</h3>
          <ul className="footer-links">
            <li>
              <Link href="/">Browse stays</Link>
            </li>
            <li>
              <Link href="/settings">Settings</Link>
            </li>
            <li>
              <Link href="/login">Log in</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3 className="footer-heading">Follow</h3>
          <div className="footer-social" aria-hidden="true">
            <span className="footer-social-icon">✕</span>
            <span className="footer-social-icon">◎</span>
            <span className="footer-social-icon">in</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} TripNest. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
