// stolen and simplified from: https://github.com/microsoft/vscode/blob/main/src/vs/base/common/fuzzyScorer.ts

const EXACT_MATCH_SCORE = 1 << 18;
const PREFIX_MATCH_SCORE = 1 << 17;
const SUBSTRING_MATCH_SCORE = 1 << 16;
const ALL_WORDS_MATCH_SCORE = 1 << 15;
const FUZZY_WORDS_MATCH_SCORE = 1 << 14;
const START_BONUS = 70000;
const WORD_START_BONUS = 35000;
const NO_MATCH = -Infinity;

const SPACE = 32;

// Same character set as the regex `\s` (and String.prototype.trim)
const isWhitespace = (c: number): boolean => {
  if (c <= SPACE) return c === SPACE || (c >= 9 && c <= 13);
  if (c < 0xa0) return false;
  return (
    c === 0xa0 ||
    c === 0x1680 ||
    (c >= 0x2000 && c <= 0x200a) ||
    c === 0x2028 ||
    c === 0x2029 ||
    c === 0x202f ||
    c === 0x205f ||
    c === 0x3000 ||
    c === 0xfeff
  );
};

const isWordChar = (c: number): boolean =>
  (c >= 97 && c <= 122) || // a-z
  (c >= 48 && c <= 57) || // 0-9
  (c >= 65 && c <= 90) || // A-Z
  (c >= 0x80 && !isWhitespace(c));

// Set of a-z and 0-9 characters in a string, as bits (digits share bits).
// Other characters aren't tracked, so masks only rule matches out: every
// match tier requires the query's characters to be in the target, or (for
// "query contains target") the target's characters to be in the query.
const charMask = (value: string): number => {
  let mask = 0;
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c >= 97 && c <= 122) mask |= 1 << (c - 97);
    else if (c >= 48 && c <= 57) mask |= 1 << (26 + ((c - 48) % 6));
  }
  return mask;
};

// A string normalized once so that scoring doesn't have to re-normalize it
interface Prepared {
  lower: string;
  noSpaces: string;
  mask: number;
}

const prepare = (value: string): Prepared => {
  const lower = value.toLowerCase();
  const noSpaces = lower.replace(/\s+/g, "");
  return { lower, noSpaces, mask: charMask(noSpaces) };
};

interface PreparedQuery extends Prepared {
  words: string[];
}

const prepareQuery = (value: string): PreparedQuery => {
  const prepared = prepare(value);
  return { ...prepared, words: prepared.lower.split(/\s+/).filter(Boolean) };
};

// For each position in `noSpaces`, whether the corresponding character starts
// a word in the original string (preceded by the start or a non-word char)
const computeWordStarts = (lower: string, noSpacesLength: number) => {
  const wordStarts = new Uint8Array(noSpacesLength);
  let position = 0;
  for (let i = 0; i < lower.length; i++) {
    if (isWhitespace(lower.charCodeAt(i))) continue;
    if (i === 0 || !isWordChar(lower.charCodeAt(i - 1))) {
      wordStarts[position] = 1;
    }
    position++;
  }
  return wordStarts;
};

// exact/prefix/substring tiers (ignoring spaces), or 0 if none apply
const tierScore = (query: Prepared, target: Prepared): number => {
  const queryNoSpaces = query.noSpaces;
  const targetNoSpaces = target.noSpaces;

  if (queryNoSpaces === targetNoSpaces)
    return EXACT_MATCH_SCORE + query.lower.length;
  if (targetNoSpaces.startsWith(queryNoSpaces))
    return PREFIX_MATCH_SCORE + query.lower.length;

  const substringIndex = targetNoSpaces.indexOf(queryNoSpaces);
  if (substringIndex === -1) return 0;

  // Add word boundary bonus for substring matches
  let wordBoundaryBonus = 0;

  // Check if match is after a space in original target
  const directIndex = target.lower.indexOf(queryNoSpaces);
  if (directIndex > 0 && target.lower.charCodeAt(directIndex - 1) === SPACE)
    wordBoundaryBonus = 500;

  return (
    SUBSTRING_MATCH_SCORE +
    query.lower.length -
    substringIndex +
    wordBoundaryBonus
  );
};

const scorePrepared = (
  query: Prepared,
  target: Prepared,
  fuzzyWords = false
): number => {
  // exact match > prefix match > substring match > fuzzy character match > empty

  if (query.noSpaces === "" || target.noSpaces === "") return 0; // empty

  if (
    (query.mask & target.mask) !== query.mask &&
    (query.mask & target.mask) !== target.mask
  )
    return 0; // neither string's characters are all in the other

  const tier = tierScore(query, target);
  if (tier !== 0) return tier;

  if (query.noSpaces.indexOf(target.noSpaces) !== -1)
    return SUBSTRING_MATCH_SCORE / 10 - query.lower.length; // query contains target

  if (fuzzyWords) return scoreFuzzyWords(query, target);

  const score = fuzzySubsequence(query.lower, target.lower, 0, -1, 0, Infinity);
  return score === NO_MATCH ? 0 : score;
};

// Fuzzy match that starts at a word and skips at most half as many characters
// as the query has, ranked below the other tiers. Unlike the default fuzzy
// match, which is anchored on the first occurrence of the query's first
// character (often mid-word), every word start is tried.
const scoreFuzzyWords = (query: Prepared, target: Prepared): number => {
  const q = query.lower;
  const t = target.lower;

  let first = 0;
  while (q.charCodeAt(first) === SPACE) first++;
  const maxGap = Math.max(1, query.noSpaces.length >> 1);

  let best = NO_MATCH;
  let hasContentBefore = false;
  for (
    let start = t.indexOf(q[first]);
    start !== -1;
    start = t.indexOf(q[first], start + 1)
  ) {
    if (start > 0 && isWordChar(t.charCodeAt(start - 1))) continue;

    if (!hasContentBefore) {
      for (let i = 0; i < start && !hasContentBefore; i++) {
        hasContentBefore = !isWhitespace(t.charCodeAt(i));
      }
    }

    const score = fuzzySubsequence(
      q,
      t,
      start,
      0,
      hasContentBefore ? 1 : 0,
      maxGap
    );
    if (score > best) best = score;
  }

  return best === NO_MATCH ? 0 : FUZZY_WORDS_MATCH_SCORE + best;
};

// Fuzzy subsequence match of q in t (skipping spaces), from t[start]. With
// firstMatchBonus -1, the first match earns the start or word start bonus if it
// is at 0 or after a space; otherwise it earns firstMatchBonus. initialGap is
// the number of non-whitespace characters treated as already skipped. Fails
// once more than maxGap characters are skipped between matches.
const fuzzySubsequence = (
  q: string,
  t: string,
  start: number,
  firstMatchBonus: number,
  initialGap: number,
  maxGap: number
): number => {
  const queryLength = q.length;
  const targetLength = t.length;

  let score = 0;
  let queryIndex = 0;
  let consecutiveBonus = 0;
  let wordBoundaryBonus = 0;
  let lastMatchIndex = -1;
  let gapPenalty = 0;
  // Non-whitespace characters seen since the last match (or the start)
  let gapSinceLastMatch = initialGap;

  for (let i = start; i < targetLength && queryIndex < queryLength; i++) {
    const c = t.charCodeAt(i);

    // Skip spaces in target
    if (c === SPACE) continue;

    // Skip spaces in query
    while (queryIndex < queryLength && q.charCodeAt(queryIndex) === SPACE) {
      queryIndex++;
    }
    if (queryIndex >= queryLength) break;

    if (c !== q.charCodeAt(queryIndex)) {
      if (!isWhitespace(c)) gapSinceLastMatch++;
      continue;
    }

    score += 1;

    if (lastMatchIndex === -1) {
      if (firstMatchBonus >= 0) {
        wordBoundaryBonus += firstMatchBonus;
      } else if (i === 0) {
        // Bonus if match starts at beginning
        wordBoundaryBonus += START_BONUS;
      } else if (t.charCodeAt(i - 1) === SPACE) {
        // Bonus if match starts after a space (word boundary)
        wordBoundaryBonus += WORD_START_BONUS;
      }
    }

    // bonus for consecutive matches (ignoring whitespace)
    if (gapSinceLastMatch === 0) {
      consecutiveBonus += 5;
    } else if (lastMatchIndex !== -1) {
      // penalize gaps between matches
      gapPenalty += gapSinceLastMatch * 2;
      if (gapPenalty > maxGap * 2) return NO_MATCH;
    }

    lastMatchIndex = i;
    gapSinceLastMatch = 0;
    queryIndex++;
  }

  // no match if not all characters in query were matched
  if (queryIndex < queryLength) return NO_MATCH;

  return score + consecutiveBonus + wordBoundaryBonus - gapPenalty;
};

// Like scorePrepared, but only exact/prefix/substring matches count, and a
// substring match must begin at the start of a word in the target
const scoreWordMatch = (
  query: Prepared,
  target: Prepared,
  wordStarts: Uint8Array
): number => {
  if (query.noSpaces === "" || target.noSpaces === "") return 0;
  if ((query.mask & target.mask) !== query.mask) return 0;

  const queryNoSpaces = query.noSpaces;
  const targetNoSpaces = target.noSpaces;

  let index = targetNoSpaces.indexOf(queryNoSpaces);
  while (index !== -1 && wordStarts[index] === 0) {
    index = targetNoSpaces.indexOf(queryNoSpaces, index + 1);
  }
  if (index === -1) return 0;

  return tierScore(query, target);
};

// Each word of a multi-word query begins a word in the target, in any order
const scoreAllWords = (
  query: PreparedQuery,
  target: Prepared,
  wordStarts: Uint8Array
): number => {
  if (query.words.length < 2) return 0;
  if ((query.mask & target.mask) !== query.mask) return 0;

  for (const word of query.words) {
    let index = target.noSpaces.indexOf(word);
    while (index !== -1 && wordStarts[index] === 0) {
      index = target.noSpaces.indexOf(word, index + 1);
    }
    if (index === -1) return 0;
  }

  return ALL_WORDS_MATCH_SCORE + query.lower.length;
};

export const fuzzyFind = (query: string, targets: string[]): string[] => {
  const preparedQuery = prepare(query);
  const results = targets
    .map((target: string) => ({
      target: target,
      score: scorePrepared(preparedQuery, prepare(target)),
    }))
    .filter((result) => result.score > 0);

  results.sort((a, b) => b.score - a.score);
  return results.map((result) => result.target);
};

// Fuse.js compatible API
interface FuzzySearchKey {
  name: string;
  weight?: number;
  /**
   * "fuzzy" (default): exact > prefix > substring > fuzzy subsequence match.
   * "fuzzyWords": like "fuzzy", but a fuzzy match must start at a word, may
   * skip at most half as many characters as the query has, and ranks below
   * the other tiers. Suits typo tolerance on short text such as titles.
   * "word": exact, prefix or substring matches only, and a substring match
   * must begin at the start of a word. Cheaper, and avoids noisy subsequence
   * matches against long text such as descriptions.
   */
  match?: "fuzzy" | "fuzzyWords" | "word";
  /**
   * Multi-word queries also match when each query word begins a word in the
   * value, in any order ("learning machine" matches "Machine Learning").
   * Ranks below substring matches.
   */
  allWords?: boolean;
}

interface FuzzySearchOptions {
  keys?: (string | FuzzySearchKey)[];
  threshold?: number;
  includeScore?: boolean;
  isCaseSensitive?: boolean;
  /** Drop results whose best weighted raw score is below this. Default 0. */
  minScore?: number;
}

interface FuzzySearchResult<T> {
  item: T;
  refIndex: number;
  score?: number;
}

// All values of one key, laid out contiguously in the flat target arrays
interface KeyRange {
  weight: number;
  match: "fuzzy" | "fuzzyWords" | "word";
  allWords: boolean;
  start: number;
  end: number;
}

interface NormalizedSearchKey {
  path: string[];
  weight: number;
  match: "fuzzy" | "fuzzyWords" | "word";
  allWords: boolean;
}

export class FuzzySearch<T> {
  private list: T[];
  private threshold: number;
  private includeScore: boolean;
  private minScore: number;

  // Values are normalized once here, so that search() only normalizes the query.
  // Note that the list is indexed at construction time: mutating items later
  // doesn't affect search results.
  private ranges: KeyRange[] = [];
  private targets: Prepared[] = [];
  private targetItems = new Int32Array();
  private targetWordStarts: (Uint8Array | null)[] = [];
  private bestScores: Float64Array;

  constructor(list: T[], options: FuzzySearchOptions = {}, deferBuild = false) {
    this.list = list;
    this.threshold = options.threshold ?? 0.3;
    this.includeScore = options.includeScore ?? false;
    this.minScore = options.minScore ?? 0;
    this.bestScores = new Float64Array(list.length);

    if (!deferBuild) this.buildTargets(this.normalizeKeys(options));
  }

  /**
   * Build a search index without monopolizing the event loop. The regular
   * constructor remains synchronous for small client-side indexes.
   */
  static async createAsync<T>(
    list: T[],
    options: FuzzySearchOptions = {},
    yieldEvery = 250
  ): Promise<FuzzySearch<T>> {
    const search = new FuzzySearch<T>(list, options, true);
    await search.buildTargetsAsync(
      search.normalizeKeys(options),
      Math.max(1, yieldEvery)
    );
    return search;
  }

  private normalizeKeys(options: FuzzySearchOptions): NormalizedSearchKey[] {
    // Normalize keys. Highest weight first, so that lower-weight keys can be
    // skipped for items whose score they can no longer beat.
    return (options.keys || [])
      .map((key) => (typeof key === "string" ? { name: key, weight: 1 } : key))
      .map((key) => ({
        path: key.name.split("."),
        weight: key.weight || 1,
        match: key.match ?? "fuzzy",
        allWords: key.allWords ?? false,
      }))
      .sort((a, b) => b.weight - a.weight);
  }

  private addTarget(
    itemIndex: number,
    value: unknown,
    key: NormalizedSearchKey,
    targetItems: number[]
  ) {
    const prepared = prepare(String(value));
    if (prepared.noSpaces === "") return;

    this.targets.push(prepared);
    targetItems.push(itemIndex);
    this.targetWordStarts.push(
      key.match === "word" || key.allWords
        ? computeWordStarts(prepared.lower, prepared.noSpaces.length)
        : null
    );
  }

  private buildTargets(keys: NormalizedSearchKey[]) {
    const targetItems: number[] = [];

    for (const key of keys) {
      const start = this.targets.length;

      this.list.forEach((item, itemIndex) => {
        const value = this.getValueByPath(item, key.path);

        if (Array.isArray(value)) {
          // Handle array fields (like alternateNames)
          for (const arrayItem of value) {
            this.addTarget(itemIndex, arrayItem, key, targetItems);
          }
        } else if (value != null) {
          this.addTarget(itemIndex, value, key, targetItems);
        }
      });

      this.ranges.push({
        weight: key.weight,
        match: key.match,
        allWords: key.allWords,
        start,
        end: this.targets.length,
      });
    }

    this.targetItems = Int32Array.from(targetItems);
  }

  private async buildTargetsAsync(
    keys: NormalizedSearchKey[],
    yieldEvery: number
  ) {
    const targetItems: number[] = [];
    let processedItems = 0;

    for (const key of keys) {
      const start = this.targets.length;

      for (let itemIndex = 0; itemIndex < this.list.length; itemIndex++) {
        const value = this.getValueByPath(this.list[itemIndex], key.path);

        if (Array.isArray(value)) {
          for (const arrayItem of value) {
            this.addTarget(itemIndex, arrayItem, key, targetItems);
          }
        } else if (value != null) {
          this.addTarget(itemIndex, value, key, targetItems);
        }

        processedItems++;
        if (processedItems % yieldEvery === 0) {
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        }
      }

      this.ranges.push({
        weight: key.weight,
        match: key.match,
        allWords: key.allWords,
        start,
        end: this.targets.length,
      });
    }

    this.targetItems = Int32Array.from(targetItems);
  }

  search(query: string): FuzzySearchResult<T>[] {
    if (!query.trim()) return [];

    const preparedQuery = prepareQuery(query);
    const allWordsMaxScore = ALL_WORDS_MATCH_SCORE + preparedQuery.lower.length;
    // Upper bound on any score: exact is EXACT + n, fuzzy is at most
    // 70000 + 6n (n matches, n consecutive bonuses and the start bonus)
    const maxRawScore = EXACT_MATCH_SCORE + 6 * preparedQuery.lower.length;

    const { targets, targetItems, targetWordStarts } = this;
    const bestScores = this.bestScores;
    bestScores.fill(0);

    // Search across all keys
    for (const { weight, match, allWords, start, end } of this.ranges) {
      const maxScore = maxRawScore * weight;

      for (let t = start; t < end; t++) {
        const itemIndex = targetItems[t];

        // This key can't improve on what the item already has
        if (bestScores[itemIndex] >= maxScore) continue;

        let itemScore =
          match === "word"
            ? scoreWordMatch(preparedQuery, targets[t], targetWordStarts[t]!)
            : scorePrepared(preparedQuery, targets[t], match === "fuzzyWords");

        if (allWords && itemScore < allWordsMaxScore) {
          itemScore = Math.max(
            itemScore,
            scoreAllWords(preparedQuery, targets[t], targetWordStarts[t]!)
          );
        }

        if (itemScore > 0 && itemScore * weight > bestScores[itemIndex]) {
          bestScores[itemIndex] = itemScore * weight;
        }
      }
    }

    const results: Array<FuzzySearchResult<T> & { score: number }> = [];

    for (let index = 0; index < bestScores.length; index++) {
      const bestScore = bestScores[index];
      if (bestScore <= 0 || bestScore < this.minScore) continue;

      // Normalize score to 0-1 range (lower is better, like Fuse.js)
      // Convert our high-is-better score to low-is-better
      const normalizedScore = 1 / (1 + bestScore);

      // Filter by threshold (lower score is better in normalized form)
      if (normalizedScore > this.threshold) continue;

      results.push({
        item: this.list[index],
        refIndex: index,
        score: normalizedScore,
      });
    }

    // Sort by score (lower is better)
    results.sort((a, b) => a.score - b.score);

    // Return in Fuse.js format
    return this.includeScore
      ? results
      : results.map(({ item, refIndex }) => ({ item, refIndex }));
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private getValueByPath(obj: any, path: string[]): any {
    let current = obj;

    for (const key of path) {
      if (current == null) return null;
      current = current[key];
    }

    return current;
  }
}
