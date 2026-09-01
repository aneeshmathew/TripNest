import ContinentMap from "./ContinentMap";

interface MapSectionProps {
  selectedContinent?: string;
}

function MapSection({ selectedContinent }: MapSectionProps) {
  return (
    <section className="section map-section">
      <h2 className="section-title">Find your next stay, anywhere in the world</h2>
      <p className="section-subtitle">Click a region on the map to browse apartments there</p>
      <ContinentMap selected={selectedContinent} />
    </section>
  );
}

export default MapSection;
