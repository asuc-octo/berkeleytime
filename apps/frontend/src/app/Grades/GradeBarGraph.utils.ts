import { LETTER_GRADES } from "@/lib/grades";

interface GradeCount {
  letter: string;
  count: number;
}

export type GradeChartRow = Record<string, number | string> & {
  letter: string;
};

const LETTER_GRADE_SET = new Set<string>(LETTER_GRADES);

export const isLetterGrade = (grade: string): boolean =>
  LETTER_GRADE_SET.has(grade);

export const buildGradeChartData = (
  distributions: ReadonlyArray<ReadonlyArray<GradeCount> | null | undefined>,
  dataKeys: readonly string[],
  displayedGrades: readonly string[]
): GradeChartRow[] => {
  const letterTotals = distributions.map((distribution) =>
    LETTER_GRADES.reduce(
      (total, letter) =>
        total +
        (distribution?.find((grade) => grade.letter === letter)?.count ?? 0),
      0
    )
  );
  const allGradeTotals = distributions.map(
    (distribution) =>
      distribution?.reduce((total, grade) => total + grade.count, 0) ?? 0
  );

  const rows = displayedGrades.map<GradeChartRow>((letter) => ({ letter }));

  dataKeys.forEach((key, outputIndex) => {
    const distribution = distributions[outputIndex];
    const percentages = new Map<string, number>();

    displayedGrades.forEach((letter) => {
      const total = isLetterGrade(letter)
        ? letterTotals[outputIndex]
        : allGradeTotals[outputIndex];
      const count =
        distribution?.find((grade) => grade.letter === letter)?.count ?? 0;
      percentages.set(letter, total === 0 ? 0 : (count / total) * 100);
    });

    let cumulative = 0;
    const percentiles = new Map<string, readonly [number, number]>();
    for (let index = LETTER_GRADES.length - 1; index >= 0; index -= 1) {
      const letter = LETTER_GRADES[index];
      const percentage = percentages.get(letter) ?? 0;
      percentiles.set(letter, [cumulative, cumulative + percentage]);
      cumulative += percentage;
    }

    rows.forEach((row) => {
      const letter = row.letter;
      row[key] = percentages.get(letter) ?? 0;

      const percentile = percentiles.get(letter);
      if (percentile) {
        row[`${key}_pctlLo`] = percentile[0];
        row[`${key}_pctlHi`] = percentile[1];
      }
    });
  });

  return rows;
};
