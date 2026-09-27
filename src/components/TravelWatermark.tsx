import { Building2, Footprints, Globe, Hotel, Landmark } from "lucide-react";

/**
 * Decorative, non-interactive backdrop for the whole app: a faint dashed
 * route line, two "you are here" pulse rings, and five icons standing in
 * for TripNest's own sections — Globe (Destinations), Landmark
 * (Attractions), Hotel (Hotels), Building2 (Apartments), Footprints
 * (Activities) — rather than the generic plane/compass/luggage/pin set
 * from the other project. Colors come from color-mix() against the
 * existing --color-primary/--color-border variables (no Tailwind here),
 * so it stays in sync with the theme automatically.
 *
 * Mounted once in AppShell, as a sibling of <main> rather than inside it,
 * and fixed to the viewport (not absolutely positioned across .container).
 * That's a deliberate difference from the other project's version: there,
 * the wrapping section is short and bounded (a sign-in gate, an empty
 * results panel), so positioning icons by percentage across that section
 * places them predictably. Here .container's height varies enormously by
 * page and, on the home page, includes a 100vh hero — percentage
 * positions across that combined height would land most of the icons
 * behind the hero photo, invisible, which is exactly what was reported.
 * Fixing this to the viewport instead means it's always present at a
 * consistent scale and only shows through wherever the page doesn't
 * paint over it — behind the hero while it's on screen, then visible
 * behind the search/results content once the visitor scrolls past it.
 */
function TravelWatermark() {
  return (
    <div aria-hidden="true" className="travel-watermark">
      <svg
        className="travel-watermark-lines"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          d="M -40 660 C 180 600, 260 380, 480 360 S 820 460, 1000 220 S 1180 90, 1260 40"
          strokeWidth="2"
          strokeDasharray="9 15"
          strokeLinecap="round"
        />
        <circle cx="480" cy="360" r="90" strokeWidth="1" />
        <circle cx="1000" cy="220" r="70" strokeWidth="1" />
      </svg>

      <Globe aria-hidden="true" className="travel-watermark-icon travel-watermark-destinations" />
      <Landmark aria-hidden="true" className="travel-watermark-icon travel-watermark-attractions" />
      <Hotel aria-hidden="true" className="travel-watermark-icon travel-watermark-hotels" />
      <Building2 aria-hidden="true" className="travel-watermark-icon travel-watermark-apartments" />
      <Footprints aria-hidden="true" className="travel-watermark-icon travel-watermark-activities" />
    </div>
  );
}

export default TravelWatermark;
