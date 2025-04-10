import React from "react";

const FilterModal = ({
  showModal,
  onClose,
  tempGenreFilters,
  toggleGenreFilter,
  genreCounts,
  tempPegiRating,
  setTempPegiFilter,
  allPegiRatings,
  applyFilters,
}) => {
  if (!showModal) return null;

  return (
    <div className="filter-modal-overlay">
      <div className="filter-modal">
        <div className="filter-modal-header">
          <h3>Filters</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="filter-section">
          <h4>Genre</h4>
          <div className="filter-options genre-options">
            {Object.entries(genreCounts).map(([genre, count]) => (
              <div
                key={genre}
                className={`filter-option ${
                  tempGenreFilters.includes(genre) ? "selected" : ""
                }`}
                onClick={() => toggleGenreFilter(genre)}
              >
                {genre} ({count})
              </div>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h4>PEGI Rating</h4>
          <div className="filter-options pegi-options">
            {allPegiRatings.map((rating) => (
              <div
                key={rating}
                className={`filter-option ${
                  tempPegiRating === rating ? "selected" : ""
                }`}
                onClick={() => setTempPegiFilter(rating)}
              >
                {rating}
              </div>
            ))}
          </div>
        </div>

        <div className="filter-modal-footer">
          <button className="apply-button" onClick={applyFilters}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
