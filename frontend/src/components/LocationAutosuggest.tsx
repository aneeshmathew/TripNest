"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface Suggestion {
  name: string;
  formatted: string;
  lat: number;
  lon: number;
  placeId?: string;
}

interface LocationAutosuggestProps {
  /** `name` of the visible text field, so plain GET-form submission keeps working with JS disabled. */
  name: string;
  defaultValue?: string;
  placeholder?: string;
  "aria-label": string;
  /** Prefixes every data-testid so existing e2e selectors can be extended per usage site. */
  testIdPrefix: string;
  /** Narrows suggestions to cities/countries (destination search) vs. anything (attraction search). */
  type?: "city";
  /** When a suggestion carries coordinates, also render hidden lat/lon fields under these names. */
  coordFieldNames?: { lat: string; lon: string };
  className?: string;
}

// Renders one visible text <input name={name}> — identical in shape to the
// plain inputs it replaces, so every existing GET form (Hero, SearchFilters,
// the destination/activity tab search) still works exactly as before with
// JS off. With JS on, it also shows a debounced Geoapify-backed dropdown;
// picking a suggestion fills the text field (and, if requested, hidden
// lat/lon fields) rather than auto-submitting, so the visitor still
// controls when the form is submitted.
function LocationAutosuggest({
  name,
  defaultValue = "",
  placeholder,
  "aria-label": ariaLabel,
  testIdPrefix,
  type,
  coordFieldNames,
  className
}: LocationAutosuggestProps) {
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const thisRequestId = ++requestIdRef.current;
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query });
        if (type) params.set("type", type);
        const res = await fetch(`/api/autosuggest?${params.toString()}`);
        if (!res.ok) return;
        const data = (await res.json()) as { results: Suggestion[] };
        // Ignore stale responses from an earlier keystroke that resolved late,
        // and never set state after the component has unmounted.
        if (mountedRef.current && thisRequestId === requestIdRef.current) {
          setSuggestions(data.results);
          setOpen(data.results.length > 0);
          setActiveIndex(-1);
        }
      } catch {
        // Silently degrade to a plain text field — no suggestions, no error UI.
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, type]);

  function selectSuggestion(suggestion: Suggestion) {
    setValue(suggestion.formatted);
    setCoords({ lat: suggestion.lat, lon: suggestion.lon });
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={`location-autosuggest${className ? ` ${className}` : ""}`} ref={containerRef}>
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setCoords(null); // free typing after a pick invalidates the picked coordinates
        }}
        onFocus={() => setOpen(suggestions.length > 0)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        data-testid={`${testIdPrefix}-input`}
      />
      {coordFieldNames && coords && (
        <>
          <input type="hidden" name={coordFieldNames.lat} value={coords.lat} />
          <input type="hidden" name={coordFieldNames.lon} value={coords.lon} />
        </>
      )}
      {open && suggestions.length > 0 && (
        <ul className="location-autosuggest-list" role="listbox" data-testid={`${testIdPrefix}-list`}>
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.placeId ?? `${suggestion.formatted}-${index}`}>
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={`location-autosuggest-option${index === activeIndex ? " is-active" : ""}`}
                onMouseDown={(e) => {
                  // mousedown (not click) so this fires before the input's blur/click-outside handler
                  e.preventDefault();
                  selectSuggestion(suggestion);
                }}
                data-testid={`${testIdPrefix}-option-${index}`}
              >
                <MapPin size={14} aria-hidden="true" />
                <span>{suggestion.formatted}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationAutosuggest;
