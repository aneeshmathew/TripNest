import ApartmentCard from "./ApartmentCard";
import type { Listing } from "../types/listing";

interface ApartmentListProps {
  apartments: Listing[];
}

function ApartmentList({ apartments }: ApartmentListProps) {
  return (
    <section>
      <h1 className="page-title">Featured Apartments</h1>
      <p className="subtitle">Handpicked accommodations just for you</p>
      <div className="grid">
        {apartments.map((apartment) => (
          <ApartmentCard key={apartment.id} apartment={apartment} />
        ))}
      </div>
    </section>
  );
}

export default ApartmentList;
