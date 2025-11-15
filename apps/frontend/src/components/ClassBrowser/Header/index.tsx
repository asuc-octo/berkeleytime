import classNames from "classnames";
import {
  Filter,
  FilterSolid,
  Search,
  Sparks,
  SparksSolid,
} from "iconoir-react";

import { Button, IconButton } from "@repo/theme";

import useBrowser from "../useBrowser";
import styles from "./Header.module.scss";

export default function Header() {
  const {
    query,
    updateQuery,
    expanded,
    setExpanded,
    classes,
    semester,
    year,
    responsive,
    hasActiveFilters,
    aiSearchActive,
    setAiSearchActive,
  } = useBrowser();

  const handleAiSearchSubmit = () => {
    if (aiSearchActive && query.trim()) {
      // TODO: Submit AI search request
      console.log("Natural Language Search submitted:", query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && aiSearchActive) {
      e.preventDefault();
      handleAiSearchSubmit();
    }
  };

  return (
    <div
      className={classNames(styles.root, {
        [styles.responsive]: responsive,
      })}
    >
      <div className={styles.group}>
        <label htmlFor="search" className={styles.icon}>
          <Search />
        </label>
        <input
          className={styles.input}
          type="text"
          value={query}
          name="search"
          onChange={(event) => updateQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Search ${semester} ${year} classes...`}
          onFocus={() => setExpanded(false)}
          autoFocus
          autoComplete="off"
        />
        {!aiSearchActive && (
          <div className={styles.label}>{classes.length.toLocaleString()}</div>
        )}
        <IconButton
          className={classNames(styles.sparksButton, {
            [styles.active]: aiSearchActive,
          })}
          onClick={() => setAiSearchActive(!aiSearchActive)}
          aria-label="AI Search"
        >
          {aiSearchActive ? <SparksSolid /> : <Sparks />}
        </IconButton>
      </div>
      {aiSearchActive && (
        <Button
          className={styles.aiSearchButton}
          onClick={handleAiSearchSubmit}
        >
          <SparksSolid />
          Natural Language Search
        </Button>
      )}
      <Button
        className={classNames(styles.filterButton, {
          [styles.active]: hasActiveFilters,
        })}
        onClick={() => setExpanded(!expanded)}
      >
        {hasActiveFilters ? <FilterSolid /> : <Filter />}
        {expanded ? "Close Filters" : "Open Filters"}
      </Button>
    </div>
  );
}
