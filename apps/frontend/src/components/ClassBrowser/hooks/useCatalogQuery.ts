import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@apollo/client/react";

import type {
  ICatalogClassServer,
  ICatalogFilterOptions,
  ICatalogFilters,
} from "@/lib/api/catalog";
import {
  GetCatalogFilterOptionsDocument,
  GetCatalogServerDocument,
} from "@/lib/generated/graphql";
import type {
  GetCatalogServerQueryVariables,
  Semester,
} from "@/lib/generated/graphql";

import { SortBy } from "../browser";
import { mapSortBy } from "./useCatalogFilters";

const DEFAULT_PAGE_SIZE = 25;

const mapSortOrder = (
  order: "asc" | "desc"
): GetCatalogServerQueryVariables["sortOrder"] =>
  (order === "asc"
    ? "ASC"
    : "DESC") as GetCatalogServerQueryVariables["sortOrder"];

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
  filterVariables: ICatalogFilters | undefined;
}

export interface UseCatalogQueryReturn {
  classes: ICatalogClassServer[];
  loading: boolean;
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
  const queryGenerationRef = useRef(0);

  // Use debounced search for the query
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), 300);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  // Reset page when filters/search change
  useEffect(() => {
    queryGenerationRef.current += 1;
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

  const catalogQueryVariables = useMemo<
    Omit<GetCatalogServerQueryVariables, "page" | "pageSize">
  >(
    () => ({
      year: currentYear,
      semester: currentSemester,
      search: debouncedQuery || undefined,
      filters: filterVariables,
      sortBy: debouncedQuery ? undefined : mapSortBy(sortBy),
      sortOrder: debouncedQuery ? undefined : mapSortOrder(effectiveOrder),
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
  const { data, loading, fetchMore } = useQuery(GetCatalogServerDocument, {
    variables: {
      ...catalogQueryVariables,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    },
    // Show cached data instantly, then revalidate in the background.
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  // Fetch filter options (heavily cached)
  const { data: filterOptionsData } = useQuery(
    GetCatalogFilterOptionsDocument,
    {
      variables: {
        year: currentYear,
        semester: currentSemester,
      },
      fetchPolicy: "cache-first",
    }
  );

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

    const requestGeneration = queryGenerationRef.current;
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

      if (requestGeneration !== queryGenerationRef.current) return;

      const nextPageClasses: ICatalogClassServer[] =
        nextPageData?.catalog?.results ?? [];
      if (nextPageClasses.length === 0) return;

      setClasses((previousClasses) =>
        mergeUniqueCatalogClasses(previousClasses, nextPageClasses)
      );
      setLocalPage(nextPage);
    } finally {
      if (requestGeneration === queryGenerationRef.current) {
        isLoadingNextPageRef.current = false;
        setIsLoadingNextPage(false);
      }
    }
  }, [catalogQueryVariables, fetchMore, hasNextPage, loading, localPage]);

  const isFirstPageLoading = loading && localPage === 1 && !isLoadingNextPage;
  return {
    classes,
    loading: isFirstPageLoading,
    totalCount,
    page: localPage,
    pageSize: DEFAULT_PAGE_SIZE,
    hasNextPage,
    loadNextPage,
    isLoadingNextPage,
    filterOptions: filterOptionsData?.catalogFilterOptions ?? null,
  };
}
