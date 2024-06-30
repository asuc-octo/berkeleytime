import { forwardRef } from "react";

import classNames from "classnames";
import { Filter, FilterSolid } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import IconButton from "@/components/IconButton";
import { IClass, Semester } from "@/lib/api";

import styles from "./Header.module.scss";

interface HeaderProps {
  currentQuery: string;
  currentClasses: IClass[];
  open: boolean;
  overlay: boolean;
  onOpenChange: (open: boolean) => void;
  currentSemester: Semester;
  currentYear: number;
  className?: string;
  autoFocus?: boolean;
  setCurrentQuery: (query: string) => void;
  persistent?: boolean;
}

const Header = forwardRef<HTMLInputElement, HeaderProps>(
  (
    {
      currentQuery,
      currentClasses,
      open,
      overlay,
      onOpenChange,
      currentSemester,
      currentYear,
      className,
      autoFocus,
      setCurrentQuery,
      persistent,
    },
    ref
  ) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const handleQueryChange = (value: string) => {
      if (persistent) {
        if (value) searchParams.set("query", value);
        else searchParams.delete("query");
        setSearchParams(searchParams);

        return;
      }

      setCurrentQuery(value);
    };

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
            value={currentQuery}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder={`Search ${currentSemester} ${currentYear} classes...`}
            autoFocus={autoFocus}
            // TODO: onFocus could not be passed down from the parent
            onFocus={() => overlay && open && onOpenChange(false)}
          />
          <div className={styles.label}>
            {currentClasses.length.toLocaleString()}
          </div>
          {overlay && (
            <IconButton onClick={() => onOpenChange(!open)}>
              {open ? <FilterSolid /> : <Filter />}
            </IconButton>
          )}
        </div>
      </div>
    );
  }
);

Header.displayName = "Header";

export default Header;
