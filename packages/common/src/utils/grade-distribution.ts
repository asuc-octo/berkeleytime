import { IGradeDistributionItem } from "../models/grade-distribution";

export enum Letter {
  APlus = "A+",
  A = "A",
  AMinus = "A-",
  BPlus = "B+",
  B = "B",
  BMinus = "B-",
  CPlus = "C+",
  C = "C",
  CMinus = "C-",
  DPlus = "D+",
  D = "D",
  DMinus = "D-",
  F = "F",
  NotPass = "NP",
  Pass = "P",
  Unsatisfactory = "U",
  Satisfactory = "S",
}

export interface Grade {
  letter: Letter | string;
  percentage: number;
  count: number;
}

export type GradeCounts = Pick<
  IGradeDistributionItem,
  | "countA"
  | "countAMinus"
  | "countAPlus"
  | "countB"
  | "countBMinus"
  | "countBPlus"
  | "countC"
  | "countCMinus"
  | "countCPlus"
  | "countD"
  | "countDMinus"
  | "countDPlus"
  | "countF"
  | "countNP"
  | "countP"
  | "countS"
  | "countU"
>;

const emptyCounts = (): GradeCounts => ({
  countA: 0,
  countAMinus: 0,
  countAPlus: 0,
  countB: 0,
  countBMinus: 0,
  countBPlus: 0,
  countC: 0,
  countCMinus: 0,
  countCPlus: 0,
  countD: 0,
  countDMinus: 0,
  countDPlus: 0,
  countF: 0,
  countNP: 0,
  countP: 0,
  countS: 0,
  countU: 0,
});

export const sumGradeCounts = (distributions: GradeCounts[]) => {
  return distributions.reduce<GradeCounts>((acc, distribution) => {
    acc.countA += distribution.countA;
    acc.countAMinus += distribution.countAMinus;
    acc.countAPlus += distribution.countAPlus;
    acc.countB += distribution.countB;
    acc.countBMinus += distribution.countBMinus;
    acc.countBPlus += distribution.countBPlus;
    acc.countC += distribution.countC;
    acc.countCMinus += distribution.countCMinus;
    acc.countCPlus += distribution.countCPlus;
    acc.countD += distribution.countD;
    acc.countDMinus += distribution.countDMinus;
    acc.countDPlus += distribution.countDPlus;
    acc.countF += distribution.countF;
    acc.countNP += distribution.countNP;
    acc.countP += distribution.countP;
    acc.countS += distribution.countS;
    acc.countU += distribution.countU;
    return acc;
  }, emptyCounts());
};

export const letters: { [key: string]: string } = {
  countAPlus: "A+",
  countA: "A",
  countAMinus: "A-",
  countBPlus: "B+",
  countB: "B",
  countBMinus: "B-",
  countCPlus: "C+",
  countC: "C",
  countCMinus: "C-",
  countDPlus: "D+",
  countD: "D",
  countDMinus: "D-",
  countF: "F",
  countNP: "NP",
  countP: "P",
  countU: "U",
  countS: "S",
};

export const points: { [key: string]: number } = {
  A: 4,
  "A-": 3.7,
  "A+": 4,
  B: 3,
  "B-": 2.7,
  "B+": 3.3,
  C: 2,
  "C-": 1.7,
  "C+": 2.3,
  D: 1,
  "D-": 0.7,
  "D+": 1.3,
  F: 0,
};

export const getDistribution = (distributions: GradeCounts[]) => {
  const counts = sumGradeCounts(distributions);

  const total = Object.values(counts).reduce((acc, count) => acc + count, 0);

  return Object.entries(counts).map(
    ([field, count]) =>
      ({
        letter: letters[field],
        percentage: total > 0 && count > 0 ? count / total : 0,
        count,
      }) as Grade
  );
};

export const getAverageGrade = (distribution: Grade[]) => {
  const total = distribution.reduce((acc, { letter, count }) => {
    if (letter in points) return acc + count;

    // Ignore letters not included in GPA
    return acc;
  }, 0);

  // For distributions without a GPA, return null
  if (total === 0) return null;

  const weightedTotal = distribution.reduce((acc, { letter, count }) => {
    if (letter in points) return points[letter] * count + acc;

    return acc;
  }, 0);

  return weightedTotal / total;
};

export const getPnpPercentage = (distribution: Grade[]) => {
  // Calculate (P + S) / (P + NP + S + U)
  const pnpGrades = distribution.reduce(
    (acc, { letter, count }) => {
      if (letter === Letter.Pass) acc.pass += count;
      else if (letter === Letter.Satisfactory) acc.satisfactory += count;
      else if (letter === Letter.NotPass) acc.notPass += count;
      else if (letter === Letter.Unsatisfactory) acc.unsatisfactory += count;
      return acc;
    },
    { pass: 0, satisfactory: 0, notPass: 0, unsatisfactory: 0 }
  );

  const totalPnp =
    pnpGrades.pass +
    pnpGrades.satisfactory +
    pnpGrades.notPass +
    pnpGrades.unsatisfactory;

  // If there are no PNP grades, return null
  if (totalPnp === 0) return null;

  const passingPnp = pnpGrades.pass + pnpGrades.satisfactory;
  return passingPnp / totalPnp;
};

export const getPnpPercentageFromCounts = (
  passCount?: number | null,
  noPassCount?: number | null
) => {
  const hasPass = typeof passCount === "number" && Number.isFinite(passCount);
  const hasNoPass =
    typeof noPassCount === "number" && Number.isFinite(noPassCount);

  if (!hasPass && !hasNoPass) return null;

  const safePass = hasPass ? (passCount as number) : 0;
  const safeNoPass = hasNoPass ? (noPassCount as number) : 0;
  const total = safePass + safeNoPass;

  if (total === 0) return null;

  return safePass / total;
};
