import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import Navbar from "./components/Navbar";
import SortModal from "./components/SortModal";
import ApartmentList from "./components/ApartmentList";
import LoginPage from "./components/LoginPage";
import { fetchListing, fetchListings } from "./api/listings";
import { fetchMe, logout as logoutRequest } from "./api/auth";
import { tokenStorage } from "./api/tokenStorage";
import { ApiError } from "./api/client";
import type { AuthResponse, User } from "./types/auth";
import type { Listing, SortDirection, SortOption } from "./types/listing";

const SORT_OPTION_KEY = "sortOption";
const SORT_DIRECTION_KEY = "sortDirection";

function compareBy(option: SortOption, direction: SortDirection) {
  const factor = direction === "desc" ? -1 : 1;

  return (a: Listing, b: Listing) => {
    if (option === "Price") {
      return (a.price - b.price) * factor;
    }
    if (option === "Average Rating") {
      return (a.averageRating - b.averageRating) * factor;
    }
    return a.title.localeCompare(b.title) * factor;
  };
}

interface HomePageProps {
  sortOption: SortOption;
  sortDirection: SortDirection;
}

function HomePage({ sortOption, sortDirection }: HomePageProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    fetchListings()
      .then((data) => {
        if (!cancelled) {
          setListings(data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedListings = useMemo(() => {
    const cloned = [...listings];
    if (!sortOption) return cloned;
    return cloned.sort(compareBy(sortOption, sortDirection));
  }, [listings, sortOption, sortDirection]);

  if (status === "loading") {
    return <p className="status-text">Loading apartments...</p>;
  }

  if (status === "error") {
    return <p className="status-text error-text">Couldn't load apartments. Is the backend running?</p>;
  }

  return <ApartmentList apartments={sortedListings} />;
}

function DetailsPage() {
  const { apartmentId } = useParams<{ apartmentId: string }>();
  const [apartment, setApartment] = useState<Listing | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "not-found">("loading");

  useEffect(() => {
    if (!apartmentId) return;
    let cancelled = false;

    fetchListing(apartmentId)
      .then((data) => {
        if (!cancelled) {
          setApartment(data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("not-found");
      });

    return () => {
      cancelled = true;
    };
  }, [apartmentId]);

  if (status === "loading") {
    return <p className="status-text">Loading...</p>;
  }

  if (status === "not-found" || !apartment) {
    return (
      <section className="details">
        <h2>Apartment not found</h2>
        <Link to="/">Back to home</Link>
      </section>
    );
  }

  return (
    <section className="details">
      <h2>{apartment.title}</h2>
      <img src={apartment.imageUrl} alt={apartment.title} className="details-image" />
      <p>{apartment.location}</p>
      <p>${apartment.price} / night</p>
      <p>Average rating: {apartment.averageRating}</p>
      <Link to="/" className="details-link">
        Back to home
      </Link>
    </section>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>(
    () => (localStorage.getItem(SORT_OPTION_KEY) as SortOption) || "Price"
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    () => (localStorage.getItem(SORT_DIRECTION_KEY) as SortDirection) || "asc"
  );
  const [draftOption, setDraftOption] = useState<SortOption>(sortOption);
  const [draftDirection, setDraftDirection] = useState<SortDirection>(sortDirection);
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const isAuthenticated = Boolean(currentUser);

  // On load, validate any persisted access token against the backend
  // rather than trusting localStorage blindly — the token may have
  // expired or been revoked since the last visit. apiFetch's built-in
  // refresh-on-401 (see api/client.ts) transparently handles the common
  // case of an expired-but-refreshable access token.
  useEffect(() => {
    const hasToken = Boolean(tokenStorage.getAccessToken());
    if (!hasToken) {
      setAuthChecked(true);
      return;
    }

    fetchMe()
      .then(({ user }) => setCurrentUser(user))
      .catch(() => {
        tokenStorage.clear();
        setCurrentUser(null);
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLoginSuccess = ({ accessToken, refreshToken, user }: AuthResponse) => {
    tokenStorage.setTokens(accessToken, refreshToken);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      // Best-effort server-side revocation; don't block the UI logout on it.
      logoutRequest(refreshToken).catch((err: unknown) => {
        if (!(err instanceof ApiError)) console.error(err);
      });
    }
    tokenStorage.clear();
    setCurrentUser(null);
  };

  const openSortModal = () => {
    setDraftOption(sortOption);
    setDraftDirection(sortDirection);
    setSortModalOpen(true);
  };

  const applySort = () => {
    setSortOption(draftOption);
    setSortDirection(draftDirection);
    localStorage.setItem(SORT_OPTION_KEY, draftOption);
    localStorage.setItem(SORT_DIRECTION_KEY, draftDirection);
    setSortModalOpen(false);
  };

  if (!authChecked) {
    return <p className="status-text">Loading...</p>;
  }

  return (
    <div className="app">
      <Navbar
        onOpenSort={openSortModal}
        isAuthenticated={isAuthenticated}
        userEmail={currentUser?.email}
        onLogout={handleLogout}
      />
      <main className="container">
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <HomePage sortOption={sortOption} sortDirection={sortDirection} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/apartments/:apartmentId"
            element={isAuthenticated ? <DetailsPage /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </main>

      <SortModal
        open={isAuthenticated && sortModalOpen}
        selectedOption={draftOption}
        selectedDirection={draftDirection}
        onSelectOption={setDraftOption}
        onSelectDirection={setDraftDirection}
        onApply={applySort}
        onClose={() => setSortModalOpen(false)}
      />
    </div>
  );
}

export default App;
