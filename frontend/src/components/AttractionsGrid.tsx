import Image from "next/image";
import { MapPin } from "lucide-react";
import type { GeoAttraction } from "../lib/geoapify";
import { getDestinationPhotoUrl } from "../lib/unsplash";

interface AttractionsGridProps {
  attractions: GeoAttraction[];
  placeName: string;
  /** Defaults to an attractions-flavored message; Things to Do passes its own. */
  emptyMessage?: string;
  /** Distinguishes the two tabs' grids/cards for e2e selectors. Defaults to the original Attractions tab's ids. */
  testIdPrefix?: string;
  gridTestId?: string;
}

// Shared by the Attractions tab (tourism.sights/attraction) and the Things
// to Do tab (entertainment/leisure/sport/natural) — both are Geoapify
// Places results in the same shape, just fetched with different
// `categories` (see lib/geoapify.ts). Rendered server-side — never throws
// upstream (see lib/geoapify.ts's getAttractionsNear), so an empty array
// here just means "nothing found nearby" rather than a broken page.
//
// Geoapify's Places API doesn't return photos on the free tier, so each
// card's image comes from a separate Unsplash search keyed on the
// place's own name (falls back to the destination's photo if a given
// place has no good match, so a card is never left blank).
async function AttractionsGrid({
  attractions,
  placeName,
  emptyMessage,
  testIdPrefix = "attraction",
  gridTestId = "attractions-grid"
}: AttractionsGridProps) {
  if (attractions.length === 0) {
    return <p className="status-text">{emptyMessage ?? `No attractions found near ${placeName} yet.`}</p>;
  }

  const fallbackPhotoUrl = await getDestinationPhotoUrl(placeName);
  const attractionsWithPhotos = await Promise.all(
    attractions.map(async (attraction) => ({
      attraction,
      photoUrl: await getDestinationPhotoUrl(`${attraction.name} ${placeName}`, fallbackPhotoUrl)
    }))
  );

  return (
    <div className="grid" data-testid={gridTestId}>
      {attractionsWithPhotos.map(({ attraction, photoUrl }) => (
        <a
          key={attraction.placeId ?? attraction.formatted}
          className="card attraction-card"
          href={`https://www.openstreetmap.org/?mlat=${attraction.lat}&mlon=${attraction.lon}#map=17/${attraction.lat}/${attraction.lon}`}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`${testIdPrefix}-card-${attraction.placeId ?? attraction.name}`}
        >
          {photoUrl && (
            <div className="card-image-wrap">
              <Image src={photoUrl} alt={attraction.name} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover" }} />
            </div>
          )}
          <div className="card-content">
            <h3>{attraction.name}</h3>
            <p className="attraction-address">
              <MapPin size={14} aria-hidden="true" /> {attraction.formatted}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}

export default AttractionsGrid;
