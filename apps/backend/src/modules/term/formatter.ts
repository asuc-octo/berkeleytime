import { TermType } from "@repo/common";

import { TermModule } from "./generated-types/module-types";

export function formatTerm(term: TermType): TermModule.Term {
  return {
    semester: term.category.code,
    year: term.academicYear,
    active: term.temporalPosition === "Current",
  };
}
