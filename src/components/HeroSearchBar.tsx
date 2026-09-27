"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, MapPin, Minus, Plus, Search, Users } from "lucide-react";
import LocationAutosuggest from "./LocationAutosuggest";

type OpenPanel = "dates" | "travelers" | null;

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function sameDay(a: Date | null, b: Date | null): boolean {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

// One month's worth of calendar cells: `null` for the blank leading cells
// before the 1st (rather than showing adjacent-month day numbers there),
// then a Date for each real day of the month — matches the plain single-
// month grid shown in the reference screenshot.
function getMonthCells(monthStart: Date): (Date | null)[] {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(new Date(year, month, day));
  }
  return cells;
}

// Single calendar, range-select (click a start day, then an end day) —
// replaces the earlier two-separate-native-date-input version per
// request. Built from scratch with plain Date math rather than a native
// <input type="date"> or an added calendar library: a native date input's
// popup follows the browser/OS's own dark-mode styling regardless of this
// page's CSS (which is exactly why it went dark/unreadable in dark theme
// before), so a fully custom grid — every color set explicitly below — is
// what actually guarantees this always renders light, as requested.
function DateRangeCalendar({
  rangeStart,
  rangeEnd,
  onSelect,
  onClear,
  onDone
}: {
  rangeStart: Date | null;
  rangeEnd: Date | null;
  onSelect: (day: Date) => void;
  onClear: () => void;
  onDone: () => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => {
    const base = rangeStart ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const cells = getMonthCells(viewMonth);

  return (
    <div className="hero-search-panel hero-search-panel-dates" role="dialog" aria-label="Choose dates">
      <div className="hero-calendar-header">
        <button
          type="button"
          onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span>{monthLabel(viewMonth)}</span>
        <button
          type="button"
          onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="hero-calendar-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="hero-calendar-grid">
        {cells.map((day, index) => {
          if (!day) {
            return <span key={`blank-${index}`} className="hero-calendar-cell hero-calendar-cell-blank" />;
          }
          const isStart = sameDay(day, rangeStart);
          const isEnd = sameDay(day, rangeEnd);
          // Inclusive of both endpoints (not just strictly-between days),
          // so the light band reads as one continuous strip from start to
          // end, with the solid circle for the start/end day layered on
          // top of it rather than the band stopping short of them.
          const inRange = !!rangeStart && !!rangeEnd && day >= rangeStart && day <= rangeEnd;
          const classes = ["hero-calendar-cell"];
          if (isStart || isEnd) classes.push("hero-calendar-cell-selected");
          if (inRange) classes.push("hero-calendar-cell-in-range");
          if (isStart) classes.push("hero-calendar-cell-range-start");
          if (isEnd) classes.push("hero-calendar-cell-range-end");
          return (
            <button
              key={day.toISOString()}
              type="button"
              className={classes.join(" ")}
              onClick={() => onSelect(day)}
              data-testid={`hero-search-calendar-day-${day.getDate()}`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <div className="hero-search-panel-actions">
        <button type="button" className="hero-search-panel-clear" onClick={onClear}>
          Clear
        </button>
        <button
          type="button"
          className="hero-search-panel-apply"
          onClick={onDone}
          data-testid="hero-search-dates-apply"
        >
          Apply
        </button>
      </div>
    </div>
  );
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
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
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

  function handleSelectDay(day: Date) {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(day);
      setRangeEnd(null);
      return;
    }
    if (day < rangeStart) {
      setRangeStart(day);
      return;
    }
    setRangeEnd(day);
  }

  const dateLabel =
    rangeStart && rangeEnd
      ? `${formatFullDate(rangeStart)} - ${formatFullDate(rangeEnd)}`
      : rangeStart
        ? formatFullDate(rangeStart)
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
          <DateRangeCalendar
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onSelect={handleSelectDay}
            onClear={() => {
              setRangeStart(null);
              setRangeEnd(null);
            }}
            onDone={() => setOpenPanel(null)}
          />
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
