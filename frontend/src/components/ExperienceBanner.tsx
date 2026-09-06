import Image from "next/image";
import Link from "next/link";

// Static marketing banner from an exported design asset, not rebuilt in
// code — the illustration (travelers, landmarks, a plane) doesn't map to
// any real content model, so unlike FeaturedStays/TestimonialSection
// there's no "real data" version of this to build instead. It's the
// project's first locally-hosted image (everything else is a hotlinked
// Unsplash URL) — lives in /public/images and is served directly by
// Next.js, no external request or CDN dependency.
//
// Rendered full-bleed (same width: 100vw + calc(-50vw + 50%) margin trick
// as .hero) since the source image is a very wide banner (2654×729) that
// would look cramped inside the app's normal max-width: 1080px content
// column. Placed in AppShell (see that file) rather than only on the
// homepage, so it appears once, directly above the footer, on every page —
// "Start planning" is a general call to action, not homepage-specific
// marketing copy.
//
// The "START PLANNING" button is baked into the image's pixels (it's a
// flat PNG), so on its own it isn't clickable — that's real, not a bug in
// this component, but it's misleading to show something that looks like
// a button and isn't one. Fixed with a real, invisible <Link> positioned
// on top of it at the button's exact location in the source image
// (measured directly from the pixels: x 1140-1527, y 372-450 of the
// 2654x729 image), expressed as percentages so it tracks the image
// correctly at any rendered width. Points to the same place as the
// navbar's "Start planning" link (/#featured-stays), rather than
// inventing a second destination for what reads as the same call to
// action.
function ExperienceBanner() {
  return (
    <section className="experience-banner" aria-label="The value for experience">
      <Image
        src="/images/value-for-experience-banner.png"
        alt="The Value for Experience — Relax, you're with us. We make it simple."
        width={2654}
        height={729}
        sizes="100vw"
        style={{ height: "auto", width: "100%" }}
      />
      <Link
        href="/#featured-stays"
        className="experience-banner-cta"
        aria-label="Start planning"
        data-testid="experience-banner-cta"
      />
    </section>
  );
}

export default ExperienceBanner;
