import DestinationsCarousel from "./DestinationsCarousel";

function DestinationsSection() {
  return (
    <section className="destinations-section">
      <h2 className="destinations-heading">Popular Destinations</h2>
      <p className="destinations-subheading">Top places travelers love</p>
      <DestinationsCarousel />
    </section>
  );
}

export default DestinationsSection;
