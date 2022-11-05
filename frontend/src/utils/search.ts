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
  penaltyLimit: number = 1,
  nonAdjacentPenalty: number = DEFAULT_NON_ADJACENT_PENALTY
): number | null {
  // TODO: memo this function.

  let targetLen = targetString.length;
  let queryLen = query.length;

  // If the query is longer than the target string, it can never match
  if (queryLen >= targetLen) {
    if (queryLen === targetLen && query === targetString) {
      return 0;
    }

    return null;
  }

  let penalty = 0;
  let targetIdx = -1;
  let previousMatchTargetIdx = -1;
  outer: for (let queryIdx = 0; queryIdx < queryLen; queryIdx++) {
    let queryChar = query.charCodeAt(queryIdx);
    let start = targetIdx;

    // Try to find the search query char.
    while (targetIdx < targetLen) {
      if (targetString.charCodeAt(targetIdx) === queryChar) {
        // If the target string's char is NOT at the start of a word (or the
        // start of the string) add a tiny penalty
        // TODO figure out why
        // if (targetIdx === 0 || targetString.charAt(targetIdx) === ' ') {
        //   penalty -= DEFAULT_START_BONUS;
        // } else
        if (previousMatchTargetIdx >= 0) {
          penalty += Math.min(0.4, (targetIdx - (previousMatchTargetIdx + 1)) * nonAdjacentPenalty);
        }
        previousMatchTargetIdx = targetIdx;
        targetIdx++;
        continue outer;
      }
      targetIdx++;
    }

    // This point is reached if the character isn't found.
    if (penalty < penaltyLimit) {
      targetIdx = start;
      penalty += 1;
    } else {
      return null;
    }
  }

  if (penalty > penaltyLimit) {
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
