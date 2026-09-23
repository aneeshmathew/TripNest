import { MapPin } from "lucide-react";
import type { GeoAttraction } from "../lib/geoapify";

interface AttractionsGridProps {
  attractions: GeoAttraction[];
  placeName: string;
}

// Live third-party data (Geoapify Places), rendered server-side — never
// throws upstream (see lib/geoapify.ts's getAttractionsNear), so an empty
// array here just means "nothing found nearby" rather than a broken page.
function AttractionsGrid({ attractions, placeName }: AttractionsGridProps) {
  if (attractions.length === 0) {
    return <p className="status-text">No attractions found near {placeName} yet.</p>;
  }

  return (
    <div className="grid" data-testid="attractions-grid">
      {attractions.map((attraction) => (
        <a
          key={attraction.placeId ?? attraction.formatted}
          className="card attraction-card"
          href={`https://www.openstreetmap.org/?mlat=${attraction.lat}&mlon=${attraction.lon}#map=17/${attraction.lat}/${attraction.lon}`}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`attraction-card-${attraction.placeId ?? attraction.name}`}
        >
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
