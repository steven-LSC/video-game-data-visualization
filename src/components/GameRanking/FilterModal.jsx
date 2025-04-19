import React from "react";
import styles from "./FilterModal.module.css";

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
    <div className={styles.filterModalOverlay}>
      <div className={styles.filterModal}>
        <div className={styles.filterModalHeader}>
          <h3>Filters</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.filterSection}>
          <h4>Genre</h4>
          <div className={`${styles.filterOptions} ${styles.genreOptions}`}>
            {Object.entries(genreCounts).map(([genre, count]) => (
              <div
                key={genre}
                className={`${styles.filterOption} ${
                  tempGenreFilters.includes(genre)
                    ? styles.filterOptionSelected
                    : ""
                }`}
                onClick={() => toggleGenreFilter(genre)}
              >
                {genre} ({count})
              </div>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <h4>PEGI Rating</h4>
          <div className={`${styles.filterOptions} ${styles.pegiOptions}`}>
            {allPegiRatings.map((rating) => (
              <div
                key={rating}
                className={`${styles.filterOption} ${
                  tempPegiRating === rating ? styles.filterOptionSelected : ""
                }`}
                onClick={() => setTempPegiFilter(rating)}
                data-rating={rating}
              >
                {rating}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.filterModalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.applyButton} onClick={applyFilters}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
