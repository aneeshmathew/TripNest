"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, MapPin, Minus, Plus, Search, Users } from "lucide-react";
import LocationAutosuggest from "./LocationAutosuggest";

type OpenPanel = "dates" | "travelers" | null;

function formatShortDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// TripNest has no dates/party-size filter in its real search yet (see
// app/plan/page.tsx — it only reads a "q" text query), so picking a date
// range or a traveler count here only changes what the button labels show,
// not what actually gets searched when the form submits. That's an
// intentional, honest limitation rather than an oversight — same "don't
// fake a feature that doesn't exist" approach as EasyToUseSection/
// RecommendationsSection — but it means these two controls are real,
// interactive dropdowns (unlike the static placeholders they replace),
// they just don't feed into search results yet.
function HeroSearchBar() {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!openPanel) return;

    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPanel(null);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openPanel]);

  const dateLabel =
    fromDate && toDate
      ? `${formatShortDate(fromDate)} – ${formatShortDate(toDate)}`
      : fromDate
        ? `From ${formatShortDate(fromDate)}`
        : "Any dates";

  return (
    <form className="hero-search" method="GET" action="/plan" ref={formRef} data-testid="hero-search-form">
      <div className="hero-search-field hero-search-field-location">
        <MapPin size={18} className="hero-search-field-icon" aria-hidden="true" />
        <LocationAutosuggest
          name="q"
          placeholder="Where do you want to go?"
          aria-label="Describe the trip you want"
          testIdPrefix="hero-search"
          coordFieldNames={{ lat: "lat", lon: "lon" }}
        />
      </div>

      <div className="hero-search-divider" aria-hidden="true" />

      <div className="hero-search-dropdown">
        <button
          type="button"
          className="hero-search-field hero-search-field-button"
          onClick={() => setOpenPanel((current) => (current === "dates" ? null : "dates"))}
          aria-expanded={openPanel === "dates"}
          aria-haspopup="dialog"
          data-testid="hero-search-dates-btn"
        >
          <Calendar size={18} className="hero-search-field-icon" />
          <span>{dateLabel}</span>
          <ChevronDown size={14} className="hero-search-field-chevron" />
        </button>

        {openPanel === "dates" && (
          <div className="hero-search-panel hero-search-panel-dates" role="dialog" aria-label="Choose dates">
            <div className="hero-search-panel-row">
              <label className="hero-search-panel-field">
                <span>From</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  data-testid="hero-search-date-from"
                />
              </label>
              <label className="hero-search-panel-field">
                <span>To</span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(event) => setToDate(event.target.value)}
                  data-testid="hero-search-date-to"
                />
              </label>
            </div>
            <div className="hero-search-panel-actions">
              <button
                type="button"
                className="hero-search-panel-clear"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
              >
                Clear
              </button>
              <button
                type="button"
                className="hero-search-panel-apply"
                onClick={() => setOpenPanel(null)}
                data-testid="hero-search-dates-apply"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="hero-search-divider" aria-hidden="true" />

      <div className="hero-search-dropdown">
        <button
          type="button"
          className="hero-search-field hero-search-field-button"
          onClick={() => setOpenPanel((current) => (current === "travelers" ? null : "travelers"))}
          aria-expanded={openPanel === "travelers"}
          aria-haspopup="dialog"
          data-testid="hero-search-travelers-btn"
        >
          <Users size={18} className="hero-search-field-icon" />
          <span>
            {travelers} {travelers === 1 ? "traveler" : "travelers"}
          </span>
          <ChevronDown size={14} className="hero-search-field-chevron" />
        </button>

        {openPanel === "travelers" && (
          <div
            className="hero-search-panel hero-search-panel-travelers"
            role="dialog"
            aria-label="Choose number of travelers"
          >
            <div className="hero-search-stepper">
              <span>Travelers</span>
              <div className="hero-search-stepper-controls">
                <button
                  type="button"
                  onClick={() => setTravelers((count) => Math.max(1, count - 1))}
                  aria-label="Decrease travelers"
                  disabled={travelers <= 1}
                  data-testid="hero-search-travelers-minus"
                >
                  <Minus size={14} />
                </button>
                <span data-testid="hero-search-travelers-count">{travelers}</span>
                <button
                  type="button"
                  onClick={() => setTravelers((count) => Math.min(20, count + 1))}
                  aria-label="Increase travelers"
                  disabled={travelers >= 20}
                  data-testid="hero-search-travelers-plus"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="hero-search-panel-actions">
              <button
                type="button"
                className="hero-search-panel-apply"
                onClick={() => setOpenPanel(null)}
                data-testid="hero-search-travelers-done"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      <button type="submit" className="hero-search-submit" aria-label="Start planning" data-testid="hero-search-btn">
        <Search size={18} aria-hidden="true" />
      </button>
    </form>
  );
}

export default HeroSearchBar;
