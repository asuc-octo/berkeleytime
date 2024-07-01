import { TermModule } from "./generated-types/module-types";
import { TermType } from "../../models/term";

export function formatTerm(term: TermType): TermModule.Term {
  return {
    semester: term.category.code,
    year: term.academicYear,
    active: term.temporalPosition === "Current",
  };
}
