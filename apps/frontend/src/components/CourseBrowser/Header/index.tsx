import { ComponentPropsWithRef } from "react";

import classNames from "classnames";
import { Filter, FilterSolid } from "iconoir-react";
import { useSearchParams } from "react-router-dom";

import { IconButton } from "@repo/theme";

import { ICourse } from "@/lib/api";

import styles from "./Header.module.scss";

interface HeaderProps {
  currentQuery: string;
  currentCourses: ICourse[];
  open: boolean;
  overlay: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  autoFocus?: boolean;
  setCurrentQuery: (query: string) => void;
  persistent?: boolean;
}

export default function Header({
  currentQuery,
  currentCourses,
  open,
  overlay,
  onOpenChange,
  className,
  autoFocus,
  setCurrentQuery,
  persistent,
  ref,
}: Omit<ComponentPropsWithRef<"input">, keyof HeaderProps> & HeaderProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleQueryChange = (value: string) => {
    if (persistent) {
      if (value) searchParams.set("query", value);
      else searchParams.delete("query");
      setSearchParams(searchParams, { replace: true });

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
          placeholder={`Search courses...`}
          autoFocus={autoFocus}
          // TODO: onFocus could not be passed down from the parent
          onFocus={() => overlay && open && onOpenChange(false)}
        />
        <div className={styles.label}>
          {currentCourses.length.toLocaleString()}
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
