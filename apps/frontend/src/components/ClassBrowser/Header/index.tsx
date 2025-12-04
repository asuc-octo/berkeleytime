import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, FilterSolid, Search } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import { Button } from "@repo/theme";

import useBrowser from "../useBrowser";
import styles from "./Header.module.scss";

export default function Header() {
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get("embed") === "true";

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
  } = useBrowser();

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
          placeholder={`Search ${semester} ${year} classes...`}
          onFocus={() => setExpanded(false)}
          autoFocus={!isEmbed}
          autoComplete="off"
        />
        <div className={styles.label}>{classes.length.toLocaleString()}</div>
      </div>
      <Button
        className={classNames(styles.filterButton, {
          [styles.active]: hasActiveFilters,
        })}
        onClick={() => setExpanded(!expanded)}
      >
        {hasActiveFilters ? <FilterSolid /> : <Filter />}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={expanded ? "close" : "open"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {expanded ? "Close Filters" : "Open Filters"}
          </motion.span>
        </AnimatePresence>
      </Button>
    </div>
  );
}
