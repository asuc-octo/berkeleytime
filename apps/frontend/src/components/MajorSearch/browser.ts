import { FuzzySearch } from "@/utils/fuzzy-find";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const initialize = (list: any[], customOptions?: any) => {
  const defaultOptions = {
    includeScore: true,
    threshold: 0.3,
    keys: ["name"],
  };

  const options = customOptions || defaultOptions;

  return new FuzzySearch(list, options);
};
