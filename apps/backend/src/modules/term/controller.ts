import { TermModel, TermType } from "@repo/common";

import { Semester } from "../../generated-types/graphql";
import { formatTerm } from "./formatter";

export const getTerms = async () => {
  const terms = await TermModel.find().lean();

  return terms.map((term) => formatTerm(term as TermType));
};

export const getTerm = async (year: number, semester: Semester) => {
  const term = await TermModel.findOne({
    name: `${year} ${semester}`,
  }).lean();

  if (!term) return null;

  return formatTerm(term as TermType);
};
