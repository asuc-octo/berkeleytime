import { ICatalogClass, IGradeDistribution } from "@/lib/api";
import { LETTER_GRADES as LETTER_GRADE_ORDER } from "@/lib/grades";

import { SortBy } from "./browser";

export type SortOrder = "asc" | "desc";

interface SorterContext {
  classes: readonly ICatalogClass[];
  order: SortOrder;
  relevanceScores?: Map<ICatalogClass, number>;
}

interface SortOptions {
  relevanceScores?: Map<ICatalogClass, number>;
}

type Comparator = (
  a: ICatalogClass,
  b: ICatalogClass,
  direction: number
) => number;

type Sorter = (context: SorterContext) => ICatalogClass[];

const directionFromOrder = (order: SortOrder) => (order === "asc" ? 1 : -1);

const LETTER_GRADES = new Set(LETTER_GRADE_ORDER);

const PASS_GRADES = new Set(["P", "S"]);

const compareByRelevance = (
  a: ICatalogClass,
  b: ICatalogClass,
  scores: Map<ICatalogClass, number> | undefined,
  order: SortOrder
) => {
  if (!scores || scores.size === 0) return 0;

  const scoreA = scores.get(a);
  const scoreB = scores.get(b);

  const hasA = typeof scoreA === "number";
  const hasB = typeof scoreB === "number";

  if (hasA && hasB) {
    if (scoreA === scoreB) return 0;

    return (scoreA - scoreB) * directionFromOrder(order);
  }

  if (hasA) return order === "asc" ? -1 : 1;
  if (hasB) return order === "asc" ? 1 : -1;

  return 0;
};

const compareAlphabetical = (
  a: ICatalogClass,
  b: ICatalogClass,
  direction: number
) => {
  const subjectComparison = a.subject.localeCompare(b.subject);
  if (subjectComparison !== 0) {
    return subjectComparison * direction;
  }

  const courseNumberComparison = a.number.localeCompare(b.number);
  if (courseNumberComparison !== 0) {
    return courseNumberComparison * direction;
  }

  return a.number.localeCompare(b.number) * direction;
};

const getPassFailPercentage = (
  gradeDistribution: IGradeDistribution | null | undefined
) => {
  const distribution = gradeDistribution?.distribution ?? [];

  if (
    distribution.some(
      (grade) =>
        LETTER_GRADES.has(
          grade.letter as (typeof LETTER_GRADE_ORDER)[number]
        ) && (grade.count ?? 0) > 0
    )
  ) {
    return null;
  }

  const totals = distribution.reduce(
    (acc, grade) => {
      const count = grade.count ?? 0;
      if (PASS_GRADES.has(grade.letter)) {
        acc.passCount += count;
        acc.passPercentage += grade.percentage ?? 0;
      } else if (grade.letter === "NP" || grade.letter === "U") {
        acc.failCount += count;
      } else {
        acc.otherCount += count;
      }
      acc.totalCount += count;
      return acc;
    },
    {
      passCount: 0,
      failCount: 0,
      otherCount: 0,
      totalCount: 0,
      passPercentage: 0,
    }
  );

  if (
    totals.passCount === 0 &&
    totals.passPercentage === 0 &&
    totals.totalCount === 0
  ) {
    return null;
  }

  if (totals.totalCount > 0) {
    const percentage = Math.round((totals.passCount / totals.totalCount) * 100);
    if (Number.isFinite(percentage)) {
      return Math.min(100, Math.max(0, percentage));
    }
  }

  if (totals.passPercentage > 0) {
    const percentage = Math.round(totals.passPercentage * 100);
    if (Number.isFinite(percentage)) {
      return Math.min(100, Math.max(0, percentage));
    }
  }

  return null;
};

const compareAverageGrade: Comparator = (a, b, direction) => {
  const aAvg = a.course.gradeDistribution?.average ?? null;
  const bAvg = b.course.gradeDistribution?.average ?? null;

  const aHasAverage = typeof aAvg === "number";
  const bHasAverage = typeof bAvg === "number";

  if (aHasAverage !== bHasAverage) {
    return aHasAverage ? -1 : 1;
  }

  if (aHasAverage && bHasAverage) {
    return (aAvg - bAvg) * direction;
  }

  const aPass = getPassFailPercentage(a.course.gradeDistribution);
  const bPass = getPassFailPercentage(b.course.gradeDistribution);

  const aHasPass = typeof aPass === "number";
  const bHasPass = typeof bPass === "number";

  if (aHasPass !== bHasPass) {
    return aHasPass ? -1 : 1;
  }

  if (aHasPass && bHasPass) {
    if (aPass !== bPass) {
      return (aPass - bPass) * direction;
    }
  }

  return 0;
};

const compareUnits: Comparator = (a, b, direction) => {
  const normalize = (value: number) => Math.round((value ?? 0) * 100) / 100;

  const aMin = normalize(a.unitsMin);
  const aMax = normalize(a.unitsMax);
  const bMin = normalize(b.unitsMin);
  const bMax = normalize(b.unitsMax);

  const isSingleUnit = (min: number, max: number) =>
    Math.abs(max - min) < 0.001;

  const aIsRange = !isSingleUnit(aMin, aMax);
  const bIsRange = !isSingleUnit(bMin, bMax);

  if (aIsRange !== bIsRange) {
    return aIsRange ? 1 : -1;
  }

  if (!aIsRange && !bIsRange) {
    if (aMax !== bMax) {
      return (aMax - bMax) * direction;
    }
  } else {
    if (aMin !== bMin) {
      return (aMin - bMin) * direction;
    }

    if (aMax !== bMax) {
      return (aMax - bMax) * direction;
    }
  }

  return compareAlphabetical(a, b, direction);
};

const getOpenSeats = ({ primarySection: { enrollment } }: ICatalogClass) =>
  enrollment && enrollment.latest
    ? enrollment.latest.maxEnroll - enrollment.latest.enrolledCount
    : 0;

const compareOpenSeats: Comparator = (a, b, direction) => {
  const difference = getOpenSeats(a) - getOpenSeats(b);

  if (difference !== 0) {
    return difference * direction;
  }

  return compareAlphabetical(a, b, direction);
};

const getPercentOpenSeats = ({
  primarySection: { enrollment },
}: ICatalogClass) => {
  if (!enrollment?.latest?.maxEnroll) return 0;

  return (
    (enrollment.latest.maxEnroll - enrollment.latest.enrolledCount) /
    enrollment.latest.maxEnroll
  );
};

const comparePercentOpenSeats: Comparator = (a, b, direction) => {
  const difference = getPercentOpenSeats(a) - getPercentOpenSeats(b);

  if (difference !== 0) {
    return difference * direction;
  }

  return compareAlphabetical(a, b, direction);
};

const sortWithRelevance = (
  { classes, order, relevanceScores }: SorterContext,
  comparator: Comparator
) => {
  const direction = directionFromOrder(order);

  return [...classes].sort((a, b) => {
    const relevanceComparison = compareByRelevance(
      a,
      b,
      relevanceScores,
      order
    );

    if (relevanceComparison !== 0) {
      return relevanceComparison;
    }

    const comparison = comparator(a, b, direction);

    if (comparison !== 0) {
      return comparison;
    }

    return 0;
  });
};

const sortByRelevance: Sorter = ({ classes, order, relevanceScores }) => {
  if (!relevanceScores || relevanceScores.size === 0) {
    const result = [...classes];

    if (order === "desc") {
      result.reverse();
    }

    return result;
  }

  return [...classes].sort((a, b) => {
    const comparison = compareByRelevance(a, b, relevanceScores, order);

    if (comparison !== 0) {
      return comparison;
    }

    return compareAlphabetical(a, b, 1);
  });
};

const sorters: Record<SortBy, Sorter> = {
  [SortBy.Relevance]: sortByRelevance,
  [SortBy.Units]: (context) => sortWithRelevance(context, compareUnits),
  [SortBy.AverageGrade]: (context) =>
    sortWithRelevance(context, compareAverageGrade),
  [SortBy.OpenSeats]: (context) => sortWithRelevance(context, compareOpenSeats),
  [SortBy.PercentOpenSeats]: (context) =>
    sortWithRelevance(context, comparePercentOpenSeats),
};

export const sortClasses = (
  classes: readonly ICatalogClass[],
  sortBy: SortBy,
  order: SortOrder,
  options: SortOptions = {}
) => {
  const sorter = sorters[sortBy];

  if (!sorter) {
    return [...classes];
  }

  return sorter({
    classes,
    order,
    relevanceScores: options.relevanceScores,
  });
};
