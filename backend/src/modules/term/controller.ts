import { TermModel } from "../../models/term";
import { formatTerm } from "./formatter";

export const getTerms = async () => {
  const terms = await TermModel.find().lean();

  return terms.map(formatTerm);
};
