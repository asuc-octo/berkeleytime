/**
 * Performs a searched clamped to distance MAX_DISTANCE. Returns
 * a negative number if not a match, else a positive number 
 * representing the distance.
 */
export function search(
    query: string,
    targetString: string,
    maxDistance: number = 0
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
                continue outer;
            }
        }

        // This point is reached if the character isn't found.
        if (penalty < maxDistance) {
          j = start;
          penalty++;
        } else {
          return -1;
        }
    }
    
    return 0;
}