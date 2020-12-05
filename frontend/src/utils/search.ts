const DEFAULT_NON_ADJACENT_PENALTY: number = 0.05;

/**
 * Performs a searched clamped to maxTypos. Returns
 * a negative number if not a match, else a positive number 
 * representing the 'distance'. Do note that the distance is not
 * the same as the number of typos.
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
    maxTypos: number = 0,
    nonAdjacentPenalty: number = DEFAULT_NON_ADJACENT_PENALTY
): number {
    // TODO: memo this function.

    let hlen = targetString.length;
    let nlen = query.length;
    
    // If the query is longer than the target string, it can never match
    if (nlen >= hlen) {
        if (nlen === hlen && query === targetString) {
            return 0;
        }
        
        return -1;
    }
    
    let penalty = 0;

    outer: for (let i = 0, j = 0; i < nlen; i++) {
        let nch = query.charCodeAt(i);
        let start = j;
        
        while (j < hlen) {
            if (targetString.charCodeAt(j++) === nch) {
                penalty += (j - start - 1) * nonAdjacentPenalty;
                continue outer;
            }
        }

        // This point is reached if the character isn't found.
        if (penalty < maxTypos) {
          j = start;
          penalty += 1;
        } else {
          return -1;
        }
    }
    
    return penalty;
}

/**
 * Combines two search queries and returns the best result
 */
export function combineQueries(query1: number, query2: number): number {
    if (query1 < 0 || query2 < 0) {
        return Math.max(query1, query2);
    }

    return Math.min(query1, query2);
}

/**
 * Normalizes a string for seraching
 */
export function normalizeSearchTerm(value: string) {
    return value.trim().toLowerCase();
}
