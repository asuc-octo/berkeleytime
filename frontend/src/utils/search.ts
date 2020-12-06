const DEFAULT_NON_ADJACENT_PENALTY: number = 0.05;
const DEFAULT_START_BONUS: number = 0.1;

/**
 * Performs a searched clamped to maxTypos. Returns
 * a negative number if not a match, else a positive number
 * representing the 'distance'. `null` means a match was not found.
 *
 * Make sure your query and targetString are the same case. This
 * doesn't handle normalization etc.
 *
 * This is like a fuzzy search but works better for abbrevations
 * by penalizing ommisions at a much lower rate than transpositions
 */
export function search(
  query: string,
  targetString: string,
  maxTypos: number = 1,
  nonAdjacentPenalty: number = DEFAULT_NON_ADJACENT_PENALTY
): number | null {
  // TODO: memo this function.

  let hlen = targetString.length;
  let nlen = query.length;

  // If the query is longer than the target string, it can never match
  if (nlen >= hlen) {
    if (nlen === hlen && query === targetString) {
      return 0;
    }

    return null;
  }

  let penalty = 0;

  outer: for (let i = 0, j = 0; i < nlen; i++) {
    let nch = query.charCodeAt(i);
    let start = j;

    // Try to find the search query char.
    while (j < hlen) {
      if (targetString.charCodeAt(j++) === nch) {
        // If the matches char is NOT at the start of word or the
        // beginning of the string, add a tiny penalty
        if (j - 1 === 0 || targetString.charAt(j - 1) === ' ') {
          penalty -= DEFAULT_START_BONUS;
        } else {
          penalty += Math.min(0.4, (j - start - 1) * nonAdjacentPenalty);
        }
        continue outer;
      }
    }

    // This point is reached if the character isn't found.
    if (penalty < maxTypos) {
      j = start;
      penalty += 1;
    } else {
      return null;
    }
  }

  if (penalty > maxTypos) {
    return null;
  } else {
    return penalty;
  }
}

/**
 * Combines two search queries and returns the best result
 */
export function combineQueries(queries: (number | null)[]): number | null {
  let start = Infinity;
  for (let i = 0; i < queries.length; i++) {
    const item = queries[i];
    if (item !== null && item < start) {
      start = item;
    }
  }
  return start === Infinity ? null : start;
}

/**
 * Normalizes a string for seraching
 */
export function normalizeSearchTerm(value: string) {
  return value.trim().toLowerCase();
}
