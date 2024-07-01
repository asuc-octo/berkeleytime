import { TermInput } from "../generated-types/graphql";

export function termToString(term: TermInput): string {
    return `${term.year} ${term.semester}`;
}

export function stringToTerm(term: string): TermInput {
    const [year, semester] = term.split(" ");
    return {
        year: parseInt(year),
        semester: semester as TermInput["semester"],
    };
}

/**
 * Gets the last day of the month that a term starts in.
 * Useful for finding the course that corresponds to a class.
 */
export function getTermStartMonth(term: TermInput) {
    const startDates = {
        "Fall": `${term.year}-08-31`,
        "Spring": `${term.year}-01-31`,
        "Summer": `${term.year}-05-31`,
        "Winter": `${term.year}-11-30`,
    }

    // @ts-expect-error - We know that the key exists
    return startDates[term.semester];
}
