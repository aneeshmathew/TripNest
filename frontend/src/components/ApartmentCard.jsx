import { Link } from "react-router-dom";

function ApartmentCard({ apartment }) {
  return (
    <article className="card" data-testid={`apartment-card-${apartment.id}`}>
      <img src={apartment.image} alt={apartment.title} />
      <div className="card-content">
        <h3>{apartment.title}</h3>
        <p>{apartment.location}</p>
        <p>${apartment.price} / night</p>
        <p>Rating: {apartment.averageRating}</p>
        <Link to={`/apartments/${apartment.id}`} className="details-link">
          View details
        </Link>
      </div>
    </article>
  );
}

export default ApartmentCard;
