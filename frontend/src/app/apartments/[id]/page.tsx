import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getListing, getListingIds } from "../../../lib/listings";
import { getReviews } from "../../../lib/reviews";
import StarRating from "../../../components/StarRating";
import ReviewsSection from "../../../components/ReviewsSection";

interface ApartmentPageProps {
  params: Promise<{ id: string }>;
}

// Pre-renders a page per listing at build time; new/changed listings are
// picked up via the revalidate window in lib/listings.ts (ISR) without
// needing a full rebuild.
export async function generateStaticParams() {
  const ids = await getListingIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: ApartmentPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    return { title: "Apartment not found" };
  }

  const description =
    listing.description ??
    `${listing.title} in ${listing.location} — $${listing.price}/night, rated ${listing.averageRating}.`;

  return {
    title: listing.title,
    description,
    openGraph: {
      title: listing.title,
      description,
      images: [{ url: listing.imageUrl }]
    }
  };
}

export default async function ApartmentPage({ params }: ApartmentPageProps) {
  const { id } = await params;
  const apartment = await getListing(id);

  if (!apartment) {
    notFound();
  }

  const reviews = await getReviews(id);

  return (
    <section className="details">
      <h2>{apartment.title}</h2>
      <div className="details-image-wrap">
        <Image
          src={apartment.imageUrl}
          alt={apartment.title}
          fill
          sizes="(max-width: 768px) 100vw, 620px"
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      <p>{apartment.location}</p>
      <p>${apartment.price} / night</p>
      <p className="rating-line">
        <StarRating rating={apartment.averageRating} />
        <span>
          {apartment.averageRating.toFixed(1)} · {apartment.reviewCount}{" "}
          {apartment.reviewCount === 1 ? "review" : "reviews"}
        </span>
      </p>
      <Link href="/" className="details-link">
        Back to home
      </Link>

      <ReviewsSection listingId={apartment.id} reviews={reviews} />
    </section>
  );
}
