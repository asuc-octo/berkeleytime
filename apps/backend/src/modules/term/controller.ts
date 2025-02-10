import { NewTermModel } from "@repo/common";

import { Semester } from "../../generated-types/graphql";
import { TermModule } from "./generated-types/module-types";

// database schema fields to select on queries.
const fields = {
  academicCareerCode: 1,
  temporalPosition: 1,
  id: 1,
  name: 1,
  beginDate: 1,
  endDate: 1,
  sessions: {
    temporalPosition: 1,
    id: 1,
    name: 1,
    beginDate: 1,
    endDate: 1,
  },
};

export const getTerms = async () => {
  const terms = await NewTermModel.find({}).lean().select(fields);

  return terms as TermModule.Term[];
};

export const getTerm = async (year: number, semester: Semester) => {
  const term = await NewTermModel.findOne({
    name: `${year} ${semester}`,
  })
    .lean()
    .select(fields);

  if (!term) return null;

  return term as TermModule.Term;
};
