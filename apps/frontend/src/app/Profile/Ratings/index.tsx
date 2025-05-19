import { useState, useMemo } from "react";
import { Search } from "iconoir-react";

import { useUserRatings } from "@/hooks/api/ratings";
import styles from "./Ratings.module.scss";

export default function Ratings() {
  const [searchQuery, setSearchQuery] = useState("");
  const { ratings, loading, error } = useUserRatings();

  const filteredRatings = useMemo(() => {
    if (!ratings) return [];
    if (!searchQuery.trim()) return ratings;

    const query = searchQuery.toLowerCase().trim();
    return ratings.filter((rating) => {
      const searchableText = `${rating.subject} ${rating.courseNumber} ${rating.semester} ${rating.year}`.toLowerCase();
      return searchableText.includes(query);
    });
  }, [ratings, searchQuery]);

  return (
    <div>
      <h1>Your Ratings</h1>
      <div className={styles.root}>
        <div className={styles.searchGroup}>
          <label htmlFor="ratingsSearch" className={styles.searchIcon}>
            <Search />
          </label>
          <input
            id="ratingsSearch"
            className={styles.searchInput}
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search Ratings..."
            autoComplete="off"
          />
        </div>

        {loading && <p>Loading your ratings...</p>}
        {error && <p>Error loading ratings: {error.message}</p>}
        {filteredRatings.length === 0 && searchQuery && !loading && (
          <p>No ratings found matching "{searchQuery}"</p>
        )}
        {filteredRatings.length > 0 && (
          <div>
            {filteredRatings.map((rating) => (
              <div 
                key={`${rating.subject}-${rating.courseNumber}-${rating.lastUpdated}`} 
                style={{ marginBottom: '20px', padding: '10px', border: '1px solid var(--border-color)' }}
              >
                <h3>{rating.subject} {rating.courseNumber}</h3>
                <p>Semester: {rating.semester} {rating.year}</p>
                <p>Class Number: {rating.classNumber}</p>
                <div>
                  <p>Ratings:</p>
                  {rating.metrics.map((metric) => (
                    <div key={metric.metricName}>
                      {metric.metricName}: {metric.value}
                    </div>
                  ))}
                </div>
                <p>Last updated: {new Date(rating.lastUpdated).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
  