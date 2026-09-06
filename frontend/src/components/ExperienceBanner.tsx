import Image from "next/image";

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
// marketing copy like PlanWithFriendsSection.
function ExperienceBanner() {
  return (
    <section className="experience-banner" aria-label="The value for experience">
      <Image
        src="/images/value-for-experience-banner.png"
        alt="The Value for Experience — Relax, you're with us. We make it simple. Start planning."
        width={2654}
        height={729}
        sizes="100vw"
        style={{ height: "auto", width: "100%" }}
      />
    </section>
  );
}

export default ExperienceBanner;
