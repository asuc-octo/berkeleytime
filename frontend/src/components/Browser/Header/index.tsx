import { forwardRef } from "react";

import classNames from "classnames";
import { Filter, FilterSolid } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import IconButton from "@/components/IconButton";
import { ICatalogCourse, Semester } from "@/lib/api";

import styles from "./Header.module.scss";

interface HeaderProps {
  currentQuery: string;
  includedCourses: ICatalogCourse[];
  open: boolean;
  overlay: boolean;
  onOpenChange: (open: boolean) => void;
  currentSemester: Semester;
  currentYear: number;
  className?: string;
  autoFocus?: boolean;
}

const Header = forwardRef<HTMLInputElement, HeaderProps>(
  (
    {
      currentQuery,
      includedCourses,
      open,
      overlay,
      onOpenChange,
      currentSemester,
      currentYear,
      className,
      autoFocus,
    },
    ref
  ) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const handleQueryChange = (value: string) => {
      if (value) searchParams.set("query", value);
      else searchParams.delete("query");
      setSearchParams(searchParams);
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
            placeholder={`Search ${currentSemester} ${currentYear} courses...`}
            autoFocus={autoFocus}
            // TODO: onFocus could not be passed down from the parent
            onFocus={() => overlay && open && onOpenChange(false)}
          />
          <div className={styles.label}>
            {includedCourses.length.toLocaleString()}
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
