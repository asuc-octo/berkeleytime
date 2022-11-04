import { GradeModel } from "./model";
import { GradeModule } from "./generated-types/module-types";

export async function grades(CourseControlNumber: number, Year: number, Semester: string): Promise<GradeModule.Grade> {
  // DATA C100: 26384 2021 "Fall"
  let grades;
  if (Year >= 1868 && ["Fall", "Spring", "Summer"].includes(Semester)) {
    grades = await GradeModel.find({CourseControlNbr: CourseControlNumber, "term.year": Year, "term.semester": Semester});
  } else {
    throw new Error("Invalid query parameters");
  }

  // Create a dictionary of grades from mongo data
  let totalEnrolled = 0;
  let letterGradeCount = 0;
  const possible_grades: { [key: string]: number } = {};
  const letterGrades = new Set(["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"]);
  const PNP = new Set(["Pass", "Not Pass"]);

  grades.map((grade)=> {
    if (grade.EnrollmentCnt && grade.GradeNm) {
      let gradeNm = grade.GradeNm;
      if (grade.GradeNm == "D-" || grade.GradeNm == "D+") {
        gradeNm = "D";
      }

      if (letterGrades.has(gradeNm) || PNP.has(gradeNm)) {
        if (gradeNm in possible_grades) {
          possible_grades[gradeNm] += grade.EnrollmentCnt;
        } else {
          possible_grades[gradeNm] = grade.EnrollmentCnt;
        }
        if (letterGrades.has(gradeNm)) {
          letterGradeCount += grade.EnrollmentCnt;
        }
        totalEnrolled += grade.EnrollmentCnt;
      }
    }
  })

  const LetterGradeZero = {
    percent: 0,
    numerator: 0,
    percentile_high: 0,
    percentile_low: 0
  }

  const gradesResponse : GradeModule.Grade = {
    APlus: LetterGradeZero,
    A: LetterGradeZero,
    AMinus: LetterGradeZero,
    BPlus: LetterGradeZero,
    B: LetterGradeZero,
    BMinus: LetterGradeZero,
    CPlus: LetterGradeZero,
    C: LetterGradeZero,
    CMinus: LetterGradeZero,
    D: LetterGradeZero,
    F: LetterGradeZero,
    P: LetterGradeZero,
    NP: LetterGradeZero
  }

  // map over response object and add percent, numerator, percentile_high, percentile_low
  let starting_percentile = 1;
  Object.keys(possible_grades).map((grade) => {
    let keyInGradeResponse = grade.replace("+", "Plus").replace("-", "Minus");
    if (grade === "Pass") {
      keyInGradeResponse = "P";
    }
    if (grade === "Not Pass") {
      keyInGradeResponse = "NP";
    }

    const percentage = Math.round((possible_grades[grade] / totalEnrolled) * 100) / 100;
    if (letterGrades.has(grade)) {
      const percentile = Math.round((possible_grades[grade] / letterGradeCount) * 100) / 100;
      const percentile_low = Math.round((starting_percentile - percentile) * 100) / 100;
      gradesResponse[keyInGradeResponse as keyof GradeModule.Grade] = {
        percent: percentage,
        numerator: possible_grades[grade],
        percentile_high: starting_percentile,
        percentile_low: percentile_low < 0 ? 0 : percentile_low
      }
      starting_percentile = percentile_low;
    } else {
      gradesResponse[keyInGradeResponse as keyof GradeModule.Grade] = {
        percent: percentage,
        numerator: possible_grades[grade],
        percentile_high: 0,
        percentile_low: 0
      }
    }
  })

  return gradesResponse;
}