import { useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import Navbar from "./components/Navbar";
import SortModal from "./components/SortModal";
import ApartmentList from "./components/ApartmentList";
import LoginPage from "./components/LoginPage";
import { apartments as apartmentData } from "./data/apartments";

const SORT_OPTION_KEY = "sortOption";
const SORT_DIRECTION_KEY = "sortDirection";
const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

function compareBy(option, direction) {
  const factor = direction === "desc" ? -1 : 1;

  return (a, b) => {
    if (option === "Price") {
      return (a.price - b.price) * factor;
    }
    if (option === "Average Rating") {
      return (a.averageRating - b.averageRating) * factor;
    }

    return a.title.localeCompare(b.title) * factor;
  };
}

function HomePage({ sortOption, sortDirection }) {
  const sortedApartments = useMemo(() => {
    const cloned = [...apartmentData];

    if (!sortOption) {
      return cloned;
    }

    return cloned.sort(compareBy(sortOption, sortDirection));
  }, [sortOption, sortDirection]);

  return <ApartmentList apartments={sortedApartments} />;
}

function DetailsPage() {
  const { apartmentId } = useParams();
  const apartment = apartmentData.find((entry) => entry.id === apartmentId);

  if (!apartment) {
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
      <img src={apartment.image} alt={apartment.title} className="details-image" />
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
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState(() => {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [sortOption, setSortOption] = useState(() => localStorage.getItem(SORT_OPTION_KEY) || "Price");
  const [sortDirection, setSortDirection] = useState(() => localStorage.getItem(SORT_DIRECTION_KEY) || "asc");
  const [draftOption, setDraftOption] = useState(sortOption);
  const [draftDirection, setDraftDirection] = useState(sortDirection);
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const isAuthenticated = Boolean(authToken);

  const handleLoginSuccess = ({ token, user }) => {
    setAuthToken(token);
    setCurrentUser(user);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuthToken("");
    setCurrentUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
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
