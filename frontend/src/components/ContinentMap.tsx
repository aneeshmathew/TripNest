import type { Continent } from "../types/listing";

interface ContinentRegion {
  value: Continent;
  label: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

// Positions are a stylized, roughly-correct layout (not real cartographic
// data) on a 1000x500 viewBox — the point is "click roughly where a
// continent is," not an accurate map. "Australia" in the UI maps to the
// OCEANIA enum value on the backend.
const regions: ContinentRegion[] = [
  { value: "NORTH_AMERICA", label: "North America", cx: 175, cy: 150, rx: 105, ry: 85 },
  { value: "SOUTH_AMERICA", label: "South America", cx: 260, cy: 350, rx: 75, ry: 105 },
  { value: "EUROPE", label: "Europe", cx: 495, cy: 115, rx: 65, ry: 55 },
  { value: "AFRICA", label: "Africa", cx: 505, cy: 300, rx: 85, ry: 110 },
  { value: "ASIA", label: "Asia", cx: 730, cy: 155, rx: 165, ry: 105 },
  { value: "OCEANIA", label: "Australia", cx: 840, cy: 385, rx: 80, ry: 55 }
];

interface ContinentMapProps {
  selected?: string;
}

function ContinentMap({ selected }: ContinentMapProps) {
  return (
    <div className="continent-map-wrap">
      <svg
        viewBox="0 0 1000 500"
        className="continent-map"
        role="img"
        aria-label="Stylized world map — click a region to browse apartments there"
      >
        {regions.map((region) => {
          const isSelected = selected === region.value;
          return (
            <a
              key={region.value}
              href={`/?continent=${region.value}`}
              className={`continent-region${isSelected ? " selected" : ""}`}
              aria-label={`Browse apartments in ${region.label}`}
              data-testid={`continent-${region.value}`}
            >
              <ellipse cx={region.cx} cy={region.cy} rx={region.rx} ry={region.ry} />
              <text x={region.cx} y={region.cy} textAnchor="middle" dominantBaseline="middle">
                {region.label}
              </text>
            </a>
          );
        })}
      </svg>
      {selected && (
        <a href="/" className="clear-filters-link continent-clear-link" data-testid="clear-continent-link">
          Clear region
        </a>
      )}
    </div>
  );
}

export default ContinentMap;
