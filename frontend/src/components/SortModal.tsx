"use client";

import { useSort } from "../context/SortContext";
import type { SortOption } from "../types/listing";

const options: SortOption[] = ["Price", "Average Rating", "Title"];

function SortModal() {
  const {
    modalOpen,
    draftOption,
    draftDirection,
    setDraftOption,
    setDraftDirection,
    applySort,
    closeModal
  } = useSort();

  if (!modalOpen) {
    return null;
  }

  return (
    <div className="overlay" role="presentation" onClick={closeModal}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>Sort Apartments</h2>

        <div className="sort-options">
          {options.map((option) => {
            const isActive = draftOption === option;
            return (
              <button
                key={option}
                type="button"
                className={`option-btn ${isActive ? "active" : ""}`}
                onClick={() => setDraftOption(option)}
                data-testid={`sort-option-${option.toLowerCase().replace(" ", "-")}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="direction">
          <button
            type="button"
            className={`direction-btn ${draftDirection === "asc" ? "active" : ""}`}
            onClick={() => setDraftDirection("asc")}
            data-testid="sort-direction-asc"
          >
            ↑ Ascending
          </button>
          <button
            type="button"
            className={`direction-btn ${draftDirection === "desc" ? "active" : ""}`}
            onClick={() => setDraftDirection("desc")}
            data-testid="sort-direction-desc"
          >
            ↓ Descending
          </button>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={closeModal} className="secondary-btn">
            Cancel
          </button>
          <button type="button" onClick={applySort} className="primary-btn" data-testid="apply-sort-btn">
            Apply Sort
          </button>
        </div>
      </div>
    </div>
  );
}

export default SortModal;
