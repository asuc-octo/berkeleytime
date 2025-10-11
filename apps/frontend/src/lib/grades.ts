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

export function getLetterGradeFromGPA(gpa: number): string {
  if (!gpa) return "F";
  if (gpa > 4) return "A+";
  if (gpa > 3.7) return "A";
  if (gpa > 3.5) return "A-";
  if (gpa > 3) return "B+";
  if (gpa > 2.7) return "B";
  if (gpa > 2.5) return "B-";
  if (gpa > 2) return "C+";
  if (gpa > 1.7) return "C";
  if (gpa > 1.5) return "C-";
  if (gpa > 1) return "D+";
  if (gpa > 0.7) return "D";

  return gpa ? "D-" : "F";
}
