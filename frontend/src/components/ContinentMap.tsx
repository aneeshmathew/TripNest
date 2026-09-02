import type { Continent } from "../types/listing";

interface ContinentRegion {
  value: Continent;
  label: string;
  path: string;
  labelX: number;
  labelY: number;
}

// Hand-drawn organic blob outlines (bezier curves, not perfect ellipses)
// on a 1000x500 viewBox, roughly positioned like the real continents —
// stylized/illustrative, not real cartographic coastline data. Paired
// with an ocean-colored backdrop (see .continent-map-ocean) so this
// actually reads as "landmasses in water," not floating shapes. "Australia"
// in the UI maps to the OCEANIA enum value on the backend.
const regions: ContinentRegion[] = [
  {
    value: "NORTH_AMERICA",
    label: "North America",
    path: "M100,68 C150,55 210,58 250,85 C275,102 280,135 265,165 C250,195 215,215 175,212 C135,209 95,190 80,155 C68,128 72,95 100,68 Z",
    labelX: 168,
    labelY: 138
  },
  {
    value: "SOUTH_AMERICA",
    label: "South America",
    path: "M262,245 C295,252 318,285 315,325 C312,365 305,405 275,435 C250,432 228,400 220,360 C213,320 218,278 240,255 C247,248 254,246 262,245 Z",
    labelX: 262,
    labelY: 340
  },
  {
    value: "EUROPE",
    label: "Europe",
    path: "M480,58 C512,52 545,62 558,88 C568,110 558,138 533,152 C505,167 470,160 452,138 C436,118 440,90 460,72 C466,66 473,61 480,58 Z",
    labelX: 500,
    labelY: 108
  },
  {
    value: "AFRICA",
    label: "Africa",
    path: "M492,178 C535,172 575,195 588,235 C600,272 592,315 575,352 C560,385 545,420 515,425 C495,428 483,400 478,370 C470,330 455,295 452,255 C450,220 462,190 492,178 Z",
    labelX: 520,
    labelY: 300
  },
  {
    value: "ASIA",
    label: "Asia",
    path: "M615,45 C700,32 790,35 855,75 C895,100 915,135 900,175 C885,212 840,235 795,240 C745,245 692,235 655,210 C615,183 585,150 580,110 C578,85 592,60 615,45 Z",
    labelX: 730,
    labelY: 150
  },
  {
    value: "OCEANIA",
    label: "Australia",
    path: "M805,338 C850,328 900,335 918,368 C930,392 915,418 880,428 C845,438 805,432 788,405 C775,384 782,352 805,338 Z",
    labelX: 850,
    labelY: 383
  }
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
        <rect className="continent-map-ocean" x="0" y="0" width="1000" height="500" />
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
              <path d={region.path} />
              <text x={region.labelX} y={region.labelY} textAnchor="middle" dominantBaseline="middle">
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
