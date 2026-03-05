import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@apollo/client/react";

import {
  GET_CATALOG,
  GET_CATALOG_FILTER_OPTIONS,
  ICatalogClassServer,
  ICatalogFilterOptions,
  ICatalogResult,
} from "@/lib/api/catalog";
import { Semester } from "@/lib/generated/graphql";

import { SortBy } from "../browser";
import { mapSortBy } from "./useCatalogFilters";

const DEFAULT_PAGE_SIZE = 25;

const getCatalogClassKey = (_class: ICatalogClassServer): string =>
  `${_class.sessionId}-${_class.subject}-${_class.courseNumber}-${_class.number}`;

const mergeUniqueCatalogClasses = (
  existingClasses: ICatalogClassServer[],
  incomingClasses: ICatalogClassServer[]
): ICatalogClassServer[] => {
  if (incomingClasses.length === 0) return existingClasses;

  const seenClassKeys = new Set(existingClasses.map(getCatalogClassKey));
  const uniqueIncomingClasses = incomingClasses.filter((incomingClass) => {
    const key = getCatalogClassKey(incomingClass);
    if (seenClassKeys.has(key)) return false;
    seenClassKeys.add(key);
    return true;
  });

  if (uniqueIncomingClasses.length === 0) return existingClasses;
  return [...existingClasses, ...uniqueIncomingClasses];
};

export interface UseCatalogQueryOptions {
  year: number;
  semester: Semester;
  query: string;
  sortBy: SortBy;
  effectiveOrder: "asc" | "desc";
  filterVariables: Record<string, unknown> | undefined;
}

export interface UseCatalogQueryReturn {
  classes: ICatalogClassServer[];
  loading: boolean;
  shouldShowCatalogOverlay: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  loadNextPage: () => Promise<void>;
  isLoadingNextPage: boolean;
  filterOptions: ICatalogFilterOptions | null;
}

export default function useCatalogQuery({
  year: currentYear,
  semester: currentSemester,
  query: rawQuery,
  sortBy,
  effectiveOrder,
  filterVariables,
}: UseCatalogQueryOptions): UseCatalogQueryReturn {
  const [localPage, setLocalPage] = useState(1);
  const [classes, setClasses] = useState<ICatalogClassServer[]>([]);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const isLoadingNextPageRef = useRef(false);
  const hasCompletedInitialLoadRef = useRef(false);

  // Use debounced search for the query
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), 300);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  // Reset page when filters/search change
  useEffect(() => {
    setLocalPage(1);
    setIsLoadingNextPage(false);
    isLoadingNextPageRef.current = false;
  }, [
    debouncedQuery,
    filterVariables,
    sortBy,
    effectiveOrder,
    currentYear,
    currentSemester,
  ]);

  const catalogQueryVariables = useMemo(
    () => ({
      year: currentYear,
      semester: currentSemester,
      search: debouncedQuery || undefined,
      filters: filterVariables,
      sortBy: debouncedQuery ? undefined : mapSortBy(sortBy),
      sortOrder: debouncedQuery ? undefined : effectiveOrder.toUpperCase(),
    }),
    [
      currentYear,
      currentSemester,
      debouncedQuery,
      filterVariables,
      sortBy,
      effectiveOrder,
    ]
  );

  // Server-side catalog query (always requests first page)
  const { data, loading, fetchMore } = useQuery<{ catalog: ICatalogResult }>(GET_CATALOG, {
    variables: {
      ...catalogQueryVariables,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // Fetch filter options (heavily cached)
  const { data: filterOptionsData } = useQuery<{ catalogFilterOptions: ICatalogFilterOptions }>(GET_CATALOG_FILTER_OPTIONS, {
    variables: {
      year: currentYear,
      semester: currentSemester,
    },
    fetchPolicy: "cache-first",
  });

  const firstPageClasses: ICatalogClassServer[] = useMemo(
    () => data?.catalog?.results ?? [],
    [data]
  );
  const totalCount: number = data?.catalog?.totalCount ?? 0;

  useEffect(() => {
    if (localPage !== 1) return;

    setClasses(firstPageClasses);
    setIsLoadingNextPage(false);
    isLoadingNextPageRef.current = false;
  }, [firstPageClasses, localPage]);

  const hasNextPage = classes.length < totalCount;

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || loading || isLoadingNextPageRef.current) return;

    const nextPage = localPage + 1;
    isLoadingNextPageRef.current = true;
    setIsLoadingNextPage(true);

    try {
      const { data: nextPageData } = await fetchMore({
        variables: {
          ...catalogQueryVariables,
          page: nextPage,
          pageSize: DEFAULT_PAGE_SIZE,
        },
      });

      const nextPageClasses: ICatalogClassServer[] =
        (nextPageData as { catalog?: ICatalogResult })?.catalog?.results ?? [];
      if (nextPageClasses.length === 0) return;

      setClasses((previousClasses) =>
        mergeUniqueCatalogClasses(previousClasses, nextPageClasses)
      );
      setLocalPage(nextPage);
    } finally {
      isLoadingNextPageRef.current = false;
      setIsLoadingNextPage(false);
    }
  }, [catalogQueryVariables, fetchMore, hasNextPage, loading, localPage]);

  const isFirstPageLoading =
    loading && localPage === 1 && !isLoadingNextPage;
  const shouldShowCatalogOverlay =
    isFirstPageLoading &&
    !hasCompletedInitialLoadRef.current &&
    classes.length === 0;

  useEffect(() => {
    if (!isFirstPageLoading) {
      hasCompletedInitialLoadRef.current = true;
    }
  }, [isFirstPageLoading]);

  return {
    classes,
    loading: isFirstPageLoading,
    shouldShowCatalogOverlay,
    totalCount,
    page: localPage,
    pageSize: DEFAULT_PAGE_SIZE,
    hasNextPage,
    loadNextPage,
    isLoadingNextPage,
    filterOptions: filterOptionsData?.catalogFilterOptions ?? null,
  };
}
