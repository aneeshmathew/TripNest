import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

// "Discover" panel — search by destination is a real, already-working
// feature (see LocationAutosuggest + app/page.tsx's search-results state),
// so this panel links straight into that instead of illustrating a
// feature that doesn't exist.
function EasyToUseSection() {
  return (
    <section className="discover-panel discover-panel-explore">
      <div className="discover-panel-text">
        <p className="discover-panel-eyebrow">Discover</p>
        <h2 className="discover-panel-title">Find your perfect destination</h2>
        <p className="discover-panel-body">
          Search by location, dates, or explore beautiful places with rich details and photos,
          curated just for you.
        </p>
        <Link href="/apartments" className="discover-panel-btn discover-panel-btn-primary">
          Start exploring
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <div className="discover-panel-visual" aria-hidden="true">
        <div className="discover-panel-photo-card">
          <Image
            src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=500&q=80"
            alt=""
            fill
            sizes="220px"
            style={{ objectFit: "cover" }}
          />
          <span className="discover-panel-photo-chip">
            <MapPin size={12} aria-hidden="true" />
            Bali
          </span>
        </div>
      </div>
    </section>
  );
}

export default EasyToUseSection;
