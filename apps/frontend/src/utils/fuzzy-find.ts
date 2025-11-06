// stolen and simplified from: https://github.com/microsoft/vscode/blob/main/src/vs/base/common/fuzzyScorer.ts

const EXACT_MATCH_SCORE = 1 << 18;
const PREFIX_MATCH_SCORE = 1 << 17;
const SUBSTRING_MATCH_SCORE = 1 << 16;

const fuzzyScore = (query: string, target: string): number => {
  // exact match > prefix match > substring match > fuzzy character match > empty

  if (query.trim() === "" || target.trim() === "") return 0; // empty

  // case insensitive
  query = query.toLowerCase();
  target = target.toLowerCase();

  // Try exact/prefix/substring matches with space-normalized versions
  const queryNoSpaces = query.replace(/\s+/g, "");
  const targetNoSpaces = target.replace(/\s+/g, "");

  if (queryNoSpaces === targetNoSpaces) return EXACT_MATCH_SCORE + query.length; // exact match (ignoring spaces)
  if (targetNoSpaces.startsWith(queryNoSpaces))
    return PREFIX_MATCH_SCORE + query.length; // prefix match (ignoring spaces)

  const substringIndex = targetNoSpaces.indexOf(queryNoSpaces);
  if (substringIndex !== -1) {
    // Add word boundary bonus for substring matches
    let wordBoundaryBonus = 0;

    // Check if match is after a space in original target
    const directIndex = target.indexOf(queryNoSpaces);
    if (directIndex > 0 && target[directIndex - 1] === " ")
      wordBoundaryBonus = 500;

    return (
      SUBSTRING_MATCH_SCORE + query.length - substringIndex + wordBoundaryBonus
    );
  }

  // fuzzy match - skip spaces in target
  let score = 0;
  let queryIndex = 0;
  let consecutiveBonus = 0;
  let wordBoundaryBonus = 0;
  let lastMatchIndex = -1;
  let firstMatchIndex = -1;
  let gapPenalty = 0;

  for (let i = 0; i < target.length && queryIndex < query.length; i++) {
    // Skip spaces in target
    if (target[i] === " ") continue;

    if (target[i] === query[queryIndex]) {
      score += 1;

      // Track first match for word boundary detection
      if (firstMatchIndex === -1) {
        firstMatchIndex = i;
        // Bonus if match starts at beginning
        if (i === 0) {
          wordBoundaryBonus += 70000;
        } else if (target[i - 1] === " ") {
          // Bonus if match starts after a space (word boundary)
          wordBoundaryBonus += 35000;
        }
      }

      // bonus for consecutive matches (ignoring spaces)
      if (
        lastMatchIndex === i - 1 ||
        (lastMatchIndex < i &&
          target.slice(lastMatchIndex + 1, i).trim() === "")
      ) {
        consecutiveBonus += 5;
      } else if (lastMatchIndex !== -1) {
        // penalize gaps between matches
        const gap = target
          .slice(lastMatchIndex + 1, i)
          .replace(/\s/g, "").length;
        gapPenalty += gap * 2;
      }

      lastMatchIndex = i;
      queryIndex++;
    }
  }

  // no match if not all characters in query were matched
  if (queryIndex < query.length) return 0;

  return score + consecutiveBonus + wordBoundaryBonus - gapPenalty;
};

export const fuzzyFind = (query: string, targets: string[]): string[] => {
  const results = targets
    .map((target: string) => ({
      target: target,
      score: fuzzyScore(query, target),
    }))
    .filter((result) => result.score > 0);

  results.sort((a, b) => b.score - a.score);
  return results.map((result) => result.target);
};

// Fuse.js compatible API
interface FuzzySearchKey {
  name: string;
  weight?: number;
}

interface FuzzySearchOptions {
  keys?: (string | FuzzySearchKey)[];
  threshold?: number;
  includeScore?: boolean;
  isCaseSensitive?: boolean;
}

interface FuzzySearchResult<T> {
  item: T;
  refIndex: number;
  score?: number;
}

export class FuzzySearch<T> {
  private list: T[];
  private keys: FuzzySearchKey[];
  private threshold: number;
  private includeScore: boolean;

  constructor(list: T[], options: FuzzySearchOptions = {}) {
    this.list = list;
    this.threshold = options.threshold ?? 0.3;
    this.includeScore = options.includeScore ?? false;

    // Normalize keys
    this.keys = (options.keys || []).map((key) =>
      typeof key === "string" ? { name: key, weight: 1 } : key
    );
  }

  search(query: string): FuzzySearchResult<T>[] {
    if (!query.trim()) return [];

    const results: Array<{
      item: T;
      refIndex: number;
      rawScore: number;
      normalizedScore: number;
    }> = [];

    this.list.forEach((item, index) => {
      let bestScore = 0;

      // Search across all keys
      for (const key of this.keys) {
        const value = this.getValueByPath(item, key.name);
        const weight = key.weight || 1;

        if (Array.isArray(value)) {
          // Handle array fields (like alternateNames)
          for (const arrayItem of value) {
            const itemScore = fuzzyScore(query, String(arrayItem));
            if (itemScore > 0) {
              bestScore = Math.max(bestScore, itemScore * weight);
            }
          }
        } else if (value != null) {
          const itemScore = fuzzyScore(query, String(value));
          if (itemScore > 0) {
            bestScore = Math.max(bestScore, itemScore * weight);
          }
        }
      }

      if (bestScore > 0) {
        // Normalize score to 0-1 range (lower is better, like Fuse.js)
        // Convert our high-is-better score to low-is-better
        const normalizedScore = 1 / (1 + bestScore);

        results.push({
          item,
          refIndex: index,
          rawScore: bestScore,
          normalizedScore,
        });
      }
    });

    // Filter by threshold (lower score is better in normalized form)
    const filtered = results.filter(
      (result) => result.normalizedScore <= this.threshold
    );

    // Sort by score (lower is better)
    filtered.sort((a, b) => a.normalizedScore - b.normalizedScore);

    // Return in Fuse.js format
    return filtered.map((result) => ({
      item: result.item,
      refIndex: result.refIndex,
      ...(this.includeScore && { score: result.normalizedScore }),
    }));
  }

  private getValueByPath(obj: any, path: string): any {
    const keys = path.split(".");
    let current = obj;

    for (const key of keys) {
      if (current == null) return null;
      current = current[key];
    }

    return current;
  }
}
