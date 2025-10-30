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

  if (query === target) return EXACT_MATCH_SCORE + query.length; // exact match
  if (target.startsWith(query)) return PREFIX_MATCH_SCORE + query.length; // prefix match

  const substringIndex = target.indexOf(query);
  if (substringIndex !== -1)
    return SUBSTRING_MATCH_SCORE + query.length - substringIndex; // substring match

  // fuzzy match
  let score = 0;
  let queryIndex = 0;
  let consecutiveBonus = 0;
  let lastMatchIndex = -1;
  for (let i = 0; i < target.length && queryIndex < query.length; i++) {
    if (target[i] === query[queryIndex]) {
      score += 1;

      // bonus for consecutive matches
      if (lastMatchIndex === i - 1) {
        consecutiveBonus += 5;
      }

      lastMatchIndex = i;
      queryIndex++;
    }
  }

  // no match if not all characters in query were matched
  if (queryIndex < query.length) return 0;

  return score + consecutiveBonus;
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
        const normalizedScore = 1 / (1 + bestScore / 1000);

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
