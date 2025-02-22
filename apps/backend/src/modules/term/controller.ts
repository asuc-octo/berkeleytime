import { NewTermModel } from "@repo/common";

import { formatTerm } from "./formatter";

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

  return terms.map(formatTerm);
};

export const getTerm = async (
  year: number,
  semester: string,
  academicCareerCode: string = "UGRD"
) => {
  const term = await NewTermModel.findOne({
    name: `${year} ${semester}`,
    academicCareerCode,
  })
    .select(fields)
    .lean();

  if (!term) return null;

  return formatTerm(term);
};
