import Link from "next/link";

export default function NotFound() {
  return (
    <section className="details">
      <h2>Page not found</h2>
      <p>That apartment or page doesn&apos;t exist.</p>
      <Link href="/" className="details-link">
        Back to home
      </Link>
    </section>
  );
}
