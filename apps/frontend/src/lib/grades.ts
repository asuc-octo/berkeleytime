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

// sort thresholds desc for binary search
const GRADE_THRESHOLDS = [
  { min: 4.0, grade: "A+" },
  { min: 3.7, grade: "A" },
  { min: 3.5, grade: "A-" },
  { min: 3.0, grade: "B+" },
  { min: 2.7, grade: "B" },
  { min: 2.5, grade: "B-" },
  { min: 2.0, grade: "C+" },
  { min: 1.7, grade: "C" },
  { min: 1.5, grade: "C-" },
  { min: 1.0, grade: "D+" },
  { min: 0.7, grade: "D" },
  { min: 0.0, grade: "D-" },
] as const;

export function getLetterGradeFromGPA(gpa: number): string {
  if (!gpa) return "F";

  let left = 0;
  let right = GRADE_THRESHOLDS.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const threshold = GRADE_THRESHOLDS[mid];

    if (gpa > threshold.min) {
      if (mid === 0 || gpa <= GRADE_THRESHOLDS[mid - 1].min) {
        return threshold.grade;
      }
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return "F";
}
