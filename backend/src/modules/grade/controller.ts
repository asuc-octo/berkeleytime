import { GradeModel } from "./model";
import { GradeModule } from "./generated-types/module-types";
// import { formatGrade } from "./formatter";

export async function grades(CourseControlNumber: number, Year: number, Semester: string): Promise<GradeModule.Grade> {
  // DATA C100: 26384 2021 "Fall"
  let grades;
  if (Year === -1 && Semester === "") {
    grades = await GradeModel.find({CourseControlNbr: CourseControlNumber});
  } else if (Year >= 1868 && ["Fall", "Spring", "Summer"].includes(Semester)) {
    grades = await GradeModel.find({CourseControlNbr: CourseControlNumber, "term.year": Year, "term.semester": Semester});
  } else {
    throw new Error("Invalid query parameters");
  }

  // total enrolled DOES NOT include students who withdrew/incomplete
  let totalEnrolled = 0;
  const possible_grades: { [key: string]: number } = {};

  grades.map((grade)=> {
    if (grade.EnrollmentCnt && grade.GradeNm) {
      if (grade.GradeNm !== "Withdrawn" && grade.GradeNm !== "Incomplete") {
        if (grade.GradeNm in possible_grades) {
          possible_grades[grade.GradeNm] += grade.EnrollmentCnt;
        } else {
          possible_grades[grade.GradeNm] = grade.EnrollmentCnt;
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

  let starting_percentile = 1;
  // map over response object and add percent, numerator, percentile_high, percentile_low
  Object.keys(gradesResponse).map((grade)=> {
    let newGrade = grade.toString().replace("Plus", "+").replace("Minus", "-")
    if (grade === "P") {
      newGrade = "Pass";
    }
    if (grade === "NP") {
      newGrade = "Not Pass"
    }

    if (newGrade in possible_grades) {
      const percentage = Math.round((possible_grades[newGrade] / totalEnrolled) * 100) / 100;
      const percentile_low = Math.round((starting_percentile - percentage) * 100) / 100;
      gradesResponse[grade as keyof GradeModule.Grade] = {
        percent: percentage,
        numerator: possible_grades[newGrade],
        percentile_high: starting_percentile,
        percentile_low: percentile_low
      }
      starting_percentile = percentile_low;
    }
  })

  return gradesResponse;
}
