import { NewTermModel } from "@repo/common";

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
  const terms = await NewTermModel.find({}).select(fields).lean();

  return terms as TermModule.Term[];
};

export const getTerm = async (id: string, academicCareerCode: string) => {
  const term = await NewTermModel.findOne({ id, academicCareerCode })
    .select(fields)
    .lean();

  if (!term) return null;

  return term as TermModule.Term;
};
