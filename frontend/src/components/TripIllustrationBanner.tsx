import Image from "next/image";

// Restores the illustration from the earlier ExperienceBanner — removed
// then brought back with a cleaned version of the same asset (text and
// button digitally removed from the image itself). The image was also
// re-cropped from the original export: it had a stray 1px border line
// baked into its very top edge (a leftover from whatever removed the old
// text/button) plus a large mostly-empty area above the illustration,
// which together rendered as a visible empty bordered gap right above
// the footer. Cropped down to the airplane + the illustration strip.
//
// The image itself stays purely decorative (alt="", no overlay link —
// nothing in it is clickable), but real heading text sits on top of it
// now — the same "Value For Experience" messaging as SearchResultsIntro
// (app/page.tsx), added here too since the cropped image still had a
// visually empty middle. Real text, not baked into the image, so it
// stays screen-reader-accessible and editable — the section itself is
// therefore NOT aria-hidden (only the <Image> is decorative); the text's
// color is hardcoded rather than following --color-text, since this
// image has its own fixed white/light background regardless of site
// theme, unlike the rest of the page.
function TripIllustrationBanner() {
  return (
    <section className="trip-illustration-banner">
      <Image
        src="/images/trip-illustration-banner.jpg"
        alt=""
        width={2658}
        height={480}
        sizes="100vw"
        style={{ height: "auto", width: "100%" }}
      />
      <div className="trip-illustration-banner-text">
        <h2 className="trip-illustration-banner-heading">The Value For Experience</h2>
        <p className="trip-illustration-banner-subheading">Relax&hellip; You&apos;re with us! We make it simple.</p>
      </div>
    </section>
  );
}

export default TripIllustrationBanner;
