import Fuse from "fuse.js";

import { IClass } from "@/lib/api";
import { subjects } from "@/lib/course";

import { SortBy } from "./browser";

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
    // TODO: Fuse types are wrong for sortFn
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const fuse = initializeFuse(classes);

    const filteredClasses = query
      ? fuse.search(query).map(({ refIndex }) => classes[refIndex])
      : classes;

    if (!sortBy) {
      postMessage(filteredClasses);

      return;
    }

    // Clone the courses to avoid sorting in-place
    filteredClasses.sort((a, b) => {
      if (sortBy === SortBy.AverageGrade) {
        return b.course.gradeAverage === a.course.gradeAverage
          ? 0
          : b.course.gradeAverage === null
            ? -1
            : a.course.gradeAverage === null
              ? 1
              : b.course.gradeAverage - a.course.gradeAverage;
      }

      if (sortBy === SortBy.Units) {
        return b.unitsMax - a.unitsMax;
      }

      if (sortBy === SortBy.OpenSeats) {
        const getOpenSeats = ({
          primarySection: { enrollCount, enrollMax },
        }: IClass) => enrollMax - enrollCount;

        return getOpenSeats(b) - getOpenSeats(a);
      }

      if (sortBy === SortBy.PercentOpenSeats) {
        const getPercentOpenSeats = ({
          primarySection: { enrollCount, enrollMax },
        }: IClass) =>
          enrollMax === 0 ? 0 : (enrollMax - enrollCount) / enrollMax;

        return getPercentOpenSeats(b) - getPercentOpenSeats(a);
      }

      // Classes are by default sorted by relevance and number
      return 0;
    });

    postMessage(filteredClasses);
  }
);