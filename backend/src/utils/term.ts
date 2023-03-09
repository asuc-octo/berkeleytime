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