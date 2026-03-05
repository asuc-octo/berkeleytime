import { useState } from "react";

import classNames from "classnames";

import { ITerm } from "@/lib/api";
import { Semester } from "@/lib/generated/graphql";

import styles from "./ClassBrowser.module.scss";
import Filters from "./Filters";
import List from "./List";
import { FilterContext } from "./context/FilterContext";
import { LayoutContext, type CatalogLayoutMode } from "./context/LayoutContext";
import { ListContext } from "./context/ListContext";
import useCatalogBrowser from "./hooks/useCatalogBrowser";

interface ClassBrowserProps {
  onSelect: (
    subject: string,
    courseNumber: string,
    number: string,
    sessionId: string
  ) => void;
  onCatalogClassAvailabilityChange?: (
    classes: {
      subject: string;
      courseNumber: string;
      number: string;
      sessionId: string;
    }[]
  ) => void;
  onLoadingChange?: (loading: boolean) => void;
  forceMode?: CatalogLayoutMode;
  semester: Semester;
  year: number;
  terms?: ITerm[];
  persistent?: boolean;
}

export default function ClassBrowser({
  onSelect,
  onCatalogClassAvailabilityChange,
  onLoadingChange,
  forceMode = "full",
  semester,
  year,
  terms,
  persistent,
}: ClassBrowserProps) {
  const [expanded, setExpanded] = useState(false);

  const browser = useCatalogBrowser({
    year,
    semester,
    terms,
    persistent,
    onLoadingChange,
    onCatalogClassAvailabilityChange,
  });

  return (
    <FilterContext value={browser.filters}>
      <ListContext value={browser.list}>
        <LayoutContext
          value={{
            mode: forceMode,
            expanded,
            setExpanded,
            query: browser.query,
            updateQuery: browser.updateQuery,
            hasActiveFilters: browser.hasActiveFilters,
            semester,
            year,
          }}
        >
          <div
            className={classNames(styles.root, {
              [styles.expanded]: expanded,
            })}
            data-mode={forceMode}
          >
            <Filters />
            <List onSelect={onSelect} />
          </div>
        </LayoutContext>
      </ListContext>
    </FilterContext>
  );
}
