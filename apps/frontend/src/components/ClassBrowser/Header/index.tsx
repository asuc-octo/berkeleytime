import classNames from "classnames";
import { Filter, FilterSolid, Search } from "iconoir-react";

import { IconButton } from "@repo/theme";

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
          autoFocus
          autoComplete="off"
        />
        <div className={styles.label}>{classes.length.toLocaleString()}</div>
        <IconButton onClick={() => setExpanded(!expanded)}>
          {expanded ? <FilterSolid /> : <Filter />}
        </IconButton>
      </div>
    </div>
  );
}
