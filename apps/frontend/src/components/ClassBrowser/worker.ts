import { IClass } from "@/lib/api";
import { FuzzySearch } from "@/utils/fuzzy-find";

import { SortBy } from "./browser";
import { searchAndSortClasses } from "./searchAndSort";
import { SortOrder } from "./sorting";

const DEFAULT_SORT_ORDER: Record<SortBy, SortOrder> = {
  [SortBy.Relevance]: "asc",
  [SortBy.Units]: "asc",
  [SortBy.AverageGrade]: "desc",
  [SortBy.OpenSeats]: "desc",
  [SortBy.PercentOpenSeats]: "desc",
};

const initializeFuse = (classes: IClass[]) => {
  const list = classes.map((_class) => {
    const { title, subject, courseNumber: number } = _class;

    const containsPrefix = /^[a-zA-Z].*/.test(number);
    const alternateNumber = number.slice(1);

    const alternateNames = containsPrefix
      ? [
          `${subject}${number}`,
          `${subject} ${alternateNumber}`,
          `${subject}${alternateNumber}`,
        ]
      : [`${subject}${number}`];

    return {
      title: _class.title ?? title,
      name: `${subject} ${number}`,
      alternateNames,
    };
  });

  const options = {
    includeScore: true,
    isCaseSensitive: false,
    // ignoreLocation: true,
    threshold: 0.25,
    keys: [
      // { name: "number", weight: 1.2 },
      "name",
      "title",
      {
        name: "alternateNames",
        weight: 2,
      },
      // { name: "subject", weight: 1.5 },
    ],
    // sortFn: (a: any, b: any) => {
    //   // First, sort by score
    //   if (a.score - b.score) return a.score - b.score;

    //   // Otherwise, sort by number
    //   return a.item[0].v.toLowerCase().localeCompare(b.item[0].v.toLowerCase());
    // },
  };

  return new FuzzySearch(list, options);
};

interface Data {
  classes: IClass[];
  query: string;
  sortBy: SortBy;
}

addEventListener(
  "message",
  ({ data: { classes, query, sortBy } }: MessageEvent<Data>) => {
    const fuse = initializeFuse(classes);
    const order = DEFAULT_SORT_ORDER[sortBy] ?? "asc";

    const sortedClasses = searchAndSortClasses({
      classes,
      index: fuse,
      query,
      sortBy,
      order,
    });

    postMessage(sortedClasses);
  }
);
