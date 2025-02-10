import { ITermItem, NewTermModel } from "@repo/common";

export type TermSelector = () => Promise<ITermItem[]>;

/**
 * Gets the 8 latest past terms. 8 is an overestimation of the 4 unique terms (UGRD, GRAD, LAW, UCBX) in a single semester.
 */
export const getRecentPastTerms = async () => {
  const pastTerms = await NewTermModel.find({ temporalPosition: "Past" })
    .lean()
    .sort({ endDate: -1 })
    .limit(8);

  return pastTerms;
};

export const getActiveTerms = async () => {
  return NewTermModel.find({
    temporalPosition: { $in: ["Current", "Future"] },
  }).lean();
};

/**
 * Gets all terms with academic year greater than five years ago, including the current and future terms.
 */
export const getLastFiveYearsTerms = async () => {
  const since = new Date().getFullYear() - 5;

  return NewTermModel.find({ academicYear: { $gte: since.toString() } }).lean();
};
