import { TermModel } from "@repo/common/models";

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
  hasCatalogData: 1,
  sessions: {
    temporalPosition: 1,
    id: 1,
    name: 1,
    beginDate: 1,
    endDate: 1,
  },
};

export const getTerms = async (withCatalogData?: boolean) => {
  const filter = withCatalogData === true ? { hasCatalogData: true } : {};
  const terms = await TermModel.find(filter).select(fields).lean();

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

/** Same chronological ordering as the main catalog default (year desc, then semester within year). */
const CATALOG_SEMESTER_ORDER: Record<string, number> = {
  Spring: 0,
  Summer: 1,
  Fall: 2,
  Winter: 3,
};

/**
 * Most recent term that has catalog data (`hasCatalogData`), matching how the catalog UI picks its default term.
 */
export async function getLatestCatalogTerm(): Promise<{
  year: number;
  semester: string;
} | null> {
  const terms = await getTerms(true);
  if (terms.length === 0) return null;

  const sorted = [...terms].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    const ao = CATALOG_SEMESTER_ORDER[a.semester] ?? -1;
    const bo = CATALOG_SEMESTER_ORDER[b.semester] ?? -1;
    return bo - ao;
  });

  const t = sorted[0];
  if (t?.year == null || !t.semester) return null;

  return { year: t.year, semester: t.semester };
}
