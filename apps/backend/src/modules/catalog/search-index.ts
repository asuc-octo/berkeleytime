import { FuzzySearch } from "@repo/common";
import type { ICatalogClassItem } from "@repo/common/models";

import { getCourseKey } from "../course/controller";

export const CATALOG_SEARCH_OPTIONS = {
  keys: [
    { name: "searchableNames", weight: 10 },
    // Titles keep typo tolerance, but only for fuzzy matches that start at a
    // word and don't skip much: in the default mode, a fuzzy match from the
    // first character outranked substring matches however much it skipped
    // ("art history" -> "Atmospheric Chemistry and Physics"). Multi-word
    // queries also match titles and descriptions containing all of the words,
    // in any order.
    {
      name: "courseTitle",
      weight: 2,
      match: "fuzzyWords" as const,
      allWords: true,
    },
    // Fuzzy subsequence matching against ~300 character descriptions matched
    // most of the catalog for short queries, so descriptions only match on
    // whole-word-prefixed substrings
    {
      name: "courseDescription",
      weight: 0.5,
      match: "word" as const,
      allWords: true,
    },
  ],
  threshold: 0.6,
  // The normalized threshold above keeps any positive score. Weighted scores
  // are tiered (every title and description tier is >= 16k), and what falls
  // below 1000 is mid-word subsequence noise against course names
  minScore: 1000,
  includeScore: true,
};

export type CatalogSearchIndex = FuzzySearch<ICatalogClassItem>;

export const buildCatalogSearchIndex = async (
  data: ICatalogClassItem[],
  formerNamesByCourse: Map<string, string[]>
): Promise<CatalogSearchIndex> => {
  const indexedData = data.map((item) => {
    const formerNames = formerNamesByCourse.get(
      getCourseKey({ ...item, number: item.courseNumber })
    );
    if (!formerNames?.length) return item;

    const formerNameVariants = formerNames.flatMap((name) => [
      name,
      name.replace(/\s+/g, ""),
    ]);

    return {
      ...item,
      searchableNames: [...(item.searchableNames ?? []), ...formerNameVariants],
    };
  });

  return FuzzySearch.createAsync<ICatalogClassItem>(
    indexedData,
    CATALOG_SEARCH_OPTIONS
  );
};

// Scores depend only on the lowercased query and its length, so queries that
// normalize to the same string share results
export const normalizeCatalogSearchQuery = (query: string) =>
  query.trim().toLowerCase().replace(/\s+/g, " ");
