import ApartmentCard from "./ApartmentCard";

function ApartmentList({ apartments }) {
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
