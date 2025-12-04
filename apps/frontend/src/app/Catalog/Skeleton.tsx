import { Filter, Search } from "iconoir-react";

import { Button, Flex, Skeleton } from "@repo/theme";

import ClassCardSkeleton from "@/components/ClassCard/Skeleton";

import styles from "./Catalog.module.scss";
import browserStyles from "@/components/ClassBrowser/ClassBrowser.module.scss";
import filterStyles from "@/components/ClassBrowser/Filters/Filters.module.scss";
import listStyles from "@/components/ClassBrowser/List/List.module.scss";
import headerStyles from "@/components/ClassBrowser/Header/Header.module.scss";

function FilterSkeleton() {
  return (
    <div className={filterStyles.root}>
      {/* Header - hidden on desktop via CSS */}
      <div className={headerStyles.root}>
        <div className={headerStyles.group}>
          <label className={headerStyles.icon}>
            <Search />
          </label>
          <input
            className={headerStyles.input}
            type="text"
            disabled
            placeholder="Search classes..."
          />
        </div>
        <Button className={headerStyles.filterButton} disabled>
          <Filter />
          <span>Close Filters</span>
        </Button>
      </div>

      <div className={filterStyles.body}>
        <div className={filterStyles.filtersHeader}>
          <p className={filterStyles.filtersTitle}>Filters</p>
        </div>

        {/* Semester */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Semester</p>
          <Skeleton style={{ height: 44, borderRadius: 4 }} />
        </div>

        {/* Sort By */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Sort By</p>
          <Skeleton style={{ height: 44, borderRadius: 4 }} />
        </div>

        {/* Department */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Department</p>
          <Skeleton style={{ height: 44, borderRadius: 4 }} />
        </div>

        {/* Requirements */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Requirements</p>
          <Skeleton style={{ height: 44, borderRadius: 4 }} />
        </div>

        {/* Class level */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Class level</p>
          <Skeleton style={{ height: 44, borderRadius: 4 }} />
        </div>

        {/* Units */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Units</p>
          <Skeleton style={{ height: 48, borderRadius: 4 }} />
        </div>

        {/* Date and Time */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Date and Time</p>
          <Skeleton style={{ height: 36, borderRadius: 4 }} />
        </div>

        {/* Grading Option */}
        <div className={filterStyles.formControl}>
          <p className={filterStyles.label}>Grading Option</p>
          <Skeleton style={{ height: 44, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className={`${listStyles.root} ${listStyles.loading}`}>
      {/* Header skeleton */}
      <div className={headerStyles.root}>
        <div className={headerStyles.group}>
          <label className={headerStyles.icon}>
            <Search />
          </label>
          <input
            className={headerStyles.input}
            type="text"
            disabled
            placeholder="Search classes..."
          />
        </div>
        <Button className={headerStyles.filterButton} disabled>
          <Filter />
          <span>Open Filters</span>
        </Button>
      </div>

      {/* Catalog title and skeleton cards */}
      <div className={listStyles.recentlyViewedSection}>
        <p className={listStyles.catalogTitle}>CATALOG</p>
      </div>
      <div className={listStyles.skeletonContainer}>
        {[...Array(8)].map((_, i) => (
          <ClassCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    </div>
  );
}

export default function CatalogSkeleton() {
  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <div className={browserStyles.root}>
          <FilterSkeleton />
          <ListSkeleton />
        </div>
      </div>

      {/* Right panel - empty like when no class selected */}
      <Flex direction="column" flexGrow="1" className={styles.view} />
    </div>
  );
}
