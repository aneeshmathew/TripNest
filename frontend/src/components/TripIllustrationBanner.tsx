import Image from "next/image";

// Restores the illustration from the earlier ExperienceBanner — removed
// then brought back with a cleaned version of the same asset (text and
// button digitally removed from the image itself). Purely decorative now:
// no overlay link, since there's no button baked in to make clickable,
// and no heading text either, since "The Value For Experience" lives as
// real text in SearchResultsIntro (app/page.tsx) instead. Same full-bleed
// treatment as .hero (width: 100vw + calc(-50vw + 50%) margins).
function TripIllustrationBanner() {
  return (
    <section className="trip-illustration-banner" aria-hidden="true">
      <Image
        src="/images/trip-illustration-banner.jpg"
        alt=""
        width={2658}
        height={735}
        sizes="100vw"
        style={{ height: "auto", width: "100%" }}
      />
    </section>
  );
}

export default TripIllustrationBanner;
