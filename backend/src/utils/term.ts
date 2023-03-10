import { Term } from "../generated-types/graphql";

export function termToString(term: Term): string {
    return `${term.year} ${term.semester}`;
}

export function stringToTerm(term: string): Term {
    const [year, semester] = term.split(" ");
    return {
        year: parseInt(year),
        semester: semester as Term["semester"],
    };
}

/**
 * Gets the last day of the month that a term starts in.
 * Useful for finding the course that corresponds to a class.
 */
export function getTermStartMonth(term: Term) {
    const startDates = {
        "Fall": `${term.year}-08-31`,
        "Spring": `${term.year}-01-31`,
        "Summer": `${term.year}-05-31`,
    }

    return startDates[term.semester];
}
