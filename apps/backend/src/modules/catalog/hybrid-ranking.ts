import { SUBJECT_NICKNAME_MAP } from "@repo/common/lib/departmentNicknames";
import type { ICatalogClassItem } from "@repo/common/models";

export interface SemanticCourseIdentity {
  subject: string;
  courseNumber: string;
}

const RRF_K = 60;

const courseKey = ({ subject, courseNumber }: SemanticCourseIdentity): string =>
  `${subject.trim().toUpperCase()}:${courseNumber.trim().toUpperCase()}`;

const normalizeWords = (value: string): string =>
  value
    .normalize("NFKD")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();

const compact = (value: string): string =>
  normalizeWords(value).replace(/ /g, "");

const getDirectMatchTier = (query: string, item: ICatalogClassItem): number => {
  const normalizedQuery = normalizeWords(query);
  const compactQuery = compact(query);
  if (!normalizedQuery) return 0;

  const nicknames = SUBJECT_NICKNAME_MAP[item.subject] ?? [];
  const identifiers = [
    `${item.subject} ${item.courseNumber}`,
    ...nicknames.map((nickname) => `${nickname} ${item.courseNumber}`),
    ...(item.searchableNames ?? []),
  ];

  if (identifiers.some((identifier) => compact(identifier) === compactQuery)) {
    return 4;
  }

  const normalizedTitle = normalizeWords(item.courseTitle ?? item.title ?? "");
  if (!normalizedTitle) return 0;
  if (normalizedTitle === normalizedQuery) return 3;
  if (normalizedTitle.startsWith(normalizedQuery)) return 2;
  if (normalizedTitle.includes(normalizedQuery)) return 1;
  return 0;
};

const buildRankMap = (
  values: readonly SemanticCourseIdentity[]
): Map<string, number> => {
  const ranks = new Map<string, number>();
  values.forEach((value, index) => {
    const key = courseKey(value);
    if (!ranks.has(key)) ranks.set(key, index + 1);
  });
  return ranks;
};

const reciprocalRank = (rank: number | undefined): number =>
  rank === undefined ? 0 : 1 / (RRF_K + rank);

/**
 * Merge lexical and semantic candidates at the course level.
 *
 * Direct identifier/title matches are deliberately ordered ahead of rank
 * fusion: dense embeddings should never hide an exact course lookup or title
 * phrase. All other candidates use reciprocal-rank fusion so agreement between
 * lexical and semantic retrieval is rewarded without comparing unlike scores.
 */
export const rankHybridCatalog = ({
  query,
  catalog,
  lexicalMatches,
  semanticMatches,
}: {
  query: string;
  catalog: readonly ICatalogClassItem[];
  lexicalMatches: readonly ICatalogClassItem[];
  semanticMatches: readonly SemanticCourseIdentity[];
}): ICatalogClassItem[] => {
  const lexicalRanks = buildRankMap(lexicalMatches);
  const semanticRanks = buildRankMap(semanticMatches);
  const candidateKeys = new Set([
    ...lexicalRanks.keys(),
    ...semanticRanks.keys(),
  ]);

  return catalog
    .map((item) => {
      const key = courseKey(item);
      const lexicalRank = lexicalRanks.get(key);
      const semanticRank = semanticRanks.get(key);
      return {
        item,
        directMatchTier: getDirectMatchTier(query, item),
        isRetrieved: candidateKeys.has(key),
        fusedScore: reciprocalRank(lexicalRank) + reciprocalRank(semanticRank),
        bestRank: Math.min(
          lexicalRank ?? Number.POSITIVE_INFINITY,
          semanticRank ?? Number.POSITIVE_INFINITY
        ),
      };
    })
    .filter(
      ({ directMatchTier, isRetrieved }) => directMatchTier > 0 || isRetrieved
    )
    .sort((left, right) => {
      if (left.directMatchTier !== right.directMatchTier) {
        return right.directMatchTier - left.directMatchTier;
      }
      if (left.fusedScore !== right.fusedScore) {
        return right.fusedScore - left.fusedScore;
      }
      if (left.bestRank !== right.bestRank) {
        return left.bestRank - right.bestRank;
      }
      const subjectOrder = left.item.subject.localeCompare(right.item.subject);
      if (subjectOrder !== 0) return subjectOrder;
      const courseOrder = left.item.courseNumber.localeCompare(
        right.item.courseNumber
      );
      if (courseOrder !== 0) return courseOrder;
      return left.item.number.localeCompare(right.item.number);
    })
    .map(({ item }) => item);
};
