import { ComponentPropsWithoutRef, forwardRef } from "react";

import classNames from "classnames";
import { Filter, FilterSolid } from "iconoir-react";

import IconButton from "@/components/IconButton";

import useBrowser from "../useBrowser";
import styles from "./Header.module.scss";

const Header = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(
  ({ className, ...props }, ref) => {
    const {
      overlay,
      query,
      updateQuery,
      expanded,
      setExpanded,
      classes,
      semester,
      year,
    } = useBrowser();

    return (
      <div
        className={classNames(
          styles.root,
          {
            [styles.overlay]: overlay,
          },
          className
        )}
      >
        <div className={styles.group}>
          <input
            className={styles.input}
            type="text"
            ref={ref}
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder={`Search ${semester} ${year} classes...`}
            onFocus={() => setExpanded(false)}
            {...props}
          />
          <div className={styles.label}>{classes.length.toLocaleString()}</div>
          {overlay && (
            <IconButton onClick={() => setExpanded(!expanded)}>
              {expanded ? <FilterSolid /> : <Filter />}
            </IconButton>
          )}
        </div>
      </div>
    );
  }
);

Header.displayName = "Header";

export default Header;
