import Fuse from "fuse.js";

import { IClass } from "@/lib/api";
import { subjects } from "@/lib/course";

import { SortBy } from "./browser";
import { SortOrder, sortClasses } from "./sorting";

const DEFAULT_SORT_ORDER: Record<SortBy, SortOrder> = {
  [SortBy.Relevance]: "asc",
  [SortBy.Units]: "asc",
  [SortBy.AverageGrade]: "desc",
  [SortBy.OpenSeats]: "desc",
  [SortBy.PercentOpenSeats]: "desc",
};

const initializeFuse = (classes: IClass[]) => {
  const list = classes.map((_class) => {
    const { title, subject, number } = _class.course;

    // For prefixed courses, prefer the number and add an abbreviation with the prefix
    const containsPrefix = /^[a-zA-Z].*/.test(number);
    const alternateNumber = number.slice(1);

    const term = subject.toLowerCase();

    const alternateNames = subjects[term]?.abbreviations.reduce(
      (acc, abbreviation) => {
        // Add alternate names for abbreviations
        const abbreviations = [
          `${abbreviation}${number}`,
          `${abbreviation} ${number}`,
        ];

        if (containsPrefix) {
          abbreviations.push(
            `${abbreviation}${alternateNumber}`,
            `${abbreviation} ${alternateNumber}`
          );
        }

        return [...acc, ...abbreviations];
      },
      // Add alternate names
      containsPrefix
        ? [
            `${subject}${number}`,
            `${subject} ${alternateNumber}`,
            `${subject}${alternateNumber}`,
          ]
        : [`${subject}${number}`]
    );

    return {
      title: _class.title ?? title,
      // subject,
      // number,
      name: `${subject} ${number}`,
      alternateNames,
    };
  });

  const options = {
    includeScore: true,
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

  return new Fuse(list, options);
};

interface Data {
  classes: IClass[];
  query: string;
  sortBy: SortBy;
}

addEventListener(
  "message",
  ({ data: { classes, query, sortBy } }: MessageEvent<Data>) => {
    const trimmedQuery = query.trim();
    const fuse = initializeFuse(classes);

    const searchResults = trimmedQuery
      ? fuse.search(trimmedQuery.slice(0, 24))
      : [];

    const filteredClasses = trimmedQuery
      ? searchResults.map(({ refIndex }) => classes[refIndex])
      : classes;

    const relevanceScores = trimmedQuery
      ? new Map<IClass, number>(
          searchResults.map(({ refIndex, score }) => [
            classes[refIndex],
            score ?? 0,
          ])
        )
      : undefined;

    const order = DEFAULT_SORT_ORDER[sortBy] ?? "asc";

    const sortedClasses = sortBy
      ? sortClasses(filteredClasses, sortBy, order, { relevanceScores })
      : [...filteredClasses];

    postMessage(sortedClasses);
  }
);
