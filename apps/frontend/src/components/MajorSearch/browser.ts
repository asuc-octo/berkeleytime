import { FuzzySearch } from "@/utils/fuzzy-find";

export const initialize = (list: any[], customOptions?: any) => {
  const defaultOptions = {
    includeScore: true,
    threshold: 0.3,
    keys: ["name"],
  };

  const options = customOptions || defaultOptions;

  return new FuzzySearch(list, options);
};
