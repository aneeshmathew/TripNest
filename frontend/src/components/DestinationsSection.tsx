import { NAT_GEO_SOURCE_URL } from "../data/natGeoDestinations";
import DestinationsCarousel from "./DestinationsCarousel";

function DestinationsSection() {
  return (
    <section className="section destinations-section">
      <h2 className="section-title">Find your next stay, anywhere in the world</h2>
      <p className="section-subtitle">Click a location to browse your destinations.</p>
      <DestinationsCarousel />
    </section>
  );
}

export default DestinationsSection;
