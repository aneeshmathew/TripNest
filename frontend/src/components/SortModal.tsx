import type { SortDirection, SortOption } from "../types/listing";

const options: SortOption[] = ["Price", "Average Rating", "Title"];

interface SortModalProps {
  open: boolean;
  selectedOption: SortOption;
  selectedDirection: SortDirection;
  onSelectOption: (option: SortOption) => void;
  onSelectDirection: (direction: SortDirection) => void;
  onApply: () => void;
  onClose: () => void;
}

function SortModal({
  open,
  selectedOption,
  selectedDirection,
  onSelectOption,
  onSelectDirection,
  onApply,
  onClose
}: SortModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2>Sort Apartments</h2>

        <div className="sort-options">
          {options.map((option) => {
            const isActive = selectedOption === option;
            return (
              <button
                key={option}
                type="button"
                className={`option-btn ${isActive ? "active" : ""}`}
                onClick={() => onSelectOption(option)}
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
            className={`direction-btn ${selectedDirection === "asc" ? "active" : ""}`}
            onClick={() => onSelectDirection("asc")}
            data-testid="sort-direction-asc"
          >
            ↑ Ascending
          </button>
          <button
            type="button"
            className={`direction-btn ${selectedDirection === "desc" ? "active" : ""}`}
            onClick={() => onSelectDirection("desc")}
            data-testid="sort-direction-desc"
          >
            ↓ Descending
          </button>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="secondary-btn">
            Cancel
          </button>
          <button type="button" onClick={onApply} className="primary-btn" data-testid="apply-sort-btn">
            Apply Sort
          </button>
        </div>
      </div>
    </div>
  );
}

export default SortModal;
