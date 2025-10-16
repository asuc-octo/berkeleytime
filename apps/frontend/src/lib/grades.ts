export const LETTER_GRADES = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "F",
] as const;

export const PASS_FAIL = ["P", "NP"] as const;

export const GRADES = [...LETTER_GRADES, ...PASS_FAIL] as const;

// gpa scale based on
// https://reslife.berkeley.edu/gpa-calculator/
export function getLetterGradeFromAverage(gpa: number): string {
  if (gpa >= 4.0) return "A+";
  if (gpa > 3.7) return "A";
  if (gpa > 3.3) return "A-";
  if (gpa > 3.0) return "B+";
  if (gpa > 2.7) return "B";
  if (gpa > 2.3) return "B-";
  if (gpa > 2.0) return "C+";
  if (gpa > 1.7) return "C";
  if (gpa > 1.3) return "C-";
  if (gpa > 1.0) return "D+";
  if (gpa > 0.7) return "D";
  if (gpa > 0) return "D-";
  if (gpa === 0) return "F";

  return "";
}
