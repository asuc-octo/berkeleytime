import { SUBJECT_NICKNAME_MAP } from "@/lib/departmentNicknames";
import { FuzzySearch } from "@/utils/fuzzy-find";

export const initialize = (
  courses: {
    title: string;
    subject: string;
    departmentNicknames?: string | null;
    number: string;
  }[]
) => {
  const list = courses.map((course) => {
    const { title, subject, departmentNicknames, number } = course;

    const containsPrefix = /^[a-zA-Z].*/.test(number);
    const alternateNumber = number.slice(1);

    const sisNicknames = departmentNicknames
      ? departmentNicknames
          .split("!")
          .map((abbr) => abbr.trim().toLowerCase())
          .filter(Boolean)
      : [];

    const hardcodedNicknames = (SUBJECT_NICKNAME_MAP[subject] || []).map((n) =>
      n.toLowerCase()
    );

    const abbreviations = [
      ...new Set([...sisNicknames, ...hardcodedNicknames]),
    ];

    const alternateNames = abbreviations.reduce(
      (acc, abbreviation) => {
        const abbrevs = [
          `${abbreviation}${number}`,
          `${abbreviation} ${number}`,
        ];

        if (containsPrefix) {
          abbrevs.push(
            `${abbreviation}${alternateNumber}`,
            `${abbreviation} ${alternateNumber}`
          );
        }

        return [...acc, ...abbrevs];
      },
      containsPrefix
        ? [
            `${subject}${number}`,
            `${subject} ${alternateNumber}`,
            `${subject}${alternateNumber}`,
          ]
        : [`${subject}${number}`]
    );

    return {
      title,
      name: `${subject} ${number}`,
      alternateNames,
    };
  });

  // Attempt to increase performance by dropping unnecessary fields
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

  return new FuzzySearch(list, options);
};
