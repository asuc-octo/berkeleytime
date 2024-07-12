import classNames from "classnames";
import { Filter, FilterSolid } from "iconoir-react";

import IconButton from "@/components/IconButton";

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
        <input
          className={styles.input}
          type="text"
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder={`Search ${semester} ${year} classes...`}
          onFocus={() => setExpanded(false)}
          autoFocus
        />
        <div className={styles.label}>{classes.length.toLocaleString()}</div>
        <IconButton onClick={() => setExpanded(!expanded)}>
          {expanded ? <FilterSolid /> : <Filter />}
        </IconButton>
      </div>
    </div>
  );
}
