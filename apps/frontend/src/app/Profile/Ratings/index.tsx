import { useEffect, useMemo, useState } from "react";

import { Search } from "iconoir-react";

import { Grid } from "@repo/theme";

import { useUserRatings } from "@/hooks/api/ratings";

import { RatingCard } from "./RatingCard";
import styles from "./Ratings.module.scss";

export default function Ratings() {
  const [searchQuery, setSearchQuery] = useState("");
  const { ratings, loading, error } = useUserRatings();

  // Preload rating links when ratings are available
  useEffect(() => {
    if (!ratings?.length) return;

    ratings.forEach((rating) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = `/catalog/${rating.year}/${rating.semester}/${rating.subject}/${rating.courseNumber}/${rating.classNumber}/ratings`;
      document.head.appendChild(link);
    });

    // Cleanup function to remove prefetch links
    return () => {
      const links = document.head.querySelectorAll('link[rel="prefetch"]');
      links.forEach((link) => link.remove());
    };
  }, [ratings]);

  const filteredRatings = useMemo(() => {
    if (!ratings) return [];
    if (!searchQuery.trim()) return ratings;

    const query = searchQuery.toLowerCase().trim();
    return ratings.filter((rating) => {
      const searchableText =
        `${rating.subject} ${rating.courseNumber} ${rating.semester} ${rating.year}`.toLowerCase();
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
          <Grid
            gap="17px"
            width="100%"
            columns="repeat(auto-fit, 345px)"
            style={{ marginBottom: 40 }}
          >
            {filteredRatings.map((rating) => (
              <RatingCard rating={rating} />
            ))}
          </Grid>
        )}
      </div>
    </div>
  );
}
