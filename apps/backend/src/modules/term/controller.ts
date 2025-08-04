import { TermModel } from "@repo/common";

import { AcademicCareerCode, Semester } from "../../generated-types/graphql";
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
    timePeriods: 1,
  },
};

export const getTerms = async () => {
  const terms = await TermModel.find({}).select(fields).lean();

  return terms.map(formatTerm);
};

export const getTerm = async (
  year: number,
  semester: Semester,
  academicCareerCode: AcademicCareerCode = "UGRD"
) => {
  const term = await TermModel.findOne({
    name: `${year} ${semester}`,
    academicCareerCode,
  })
    .select(fields)
    .lean();

  if (!term) return null;

  return formatTerm(term);
};
