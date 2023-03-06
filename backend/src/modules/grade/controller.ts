import { GradeModel, GradeType } from "./model";
import { GradeModule } from "./generated-types/module-types";
import { letterGrades, PNP, semesters } from "./constants";

export async function grades(CourseControlNumber: number, Year: number, Semester: string): Promise<GradeModule.Grade> {
  let grades;
  if (Year >= 2007 && semesters.has(Semester)) {
    grades = await GradeModel.find({CourseControlNbr: CourseControlNumber, "term.year": Year, "term.semester": Semester});
  } else {
    throw new Error("Invalid query parameters");
  }

  if (!grades) {
    throw new Error("Combination of term and year not found");
  }
  
  const {possible_grades, totalEnrolled, letterGradeCount, gpaSum} = mongoToGradesDict(grades);
  const averageGPA = round(gpaSum / letterGradeCount, 3);
  const gradesResponse = initializeGradeSchema(averageGPA, totalEnrolled);
  return updateGradeSchema(gradesResponse, possible_grades, totalEnrolled, letterGradeCount);
}

function mongoToGradesDict(grades: GradeType[]) {
  let totalEnrolled = 0, letterGradeCount = 0, gpaSum = 0;
  const possible_grades: { [key: string]: number } = {};

  grades.map((grade)=> {
    if (grade.EnrollmentCnt && grade.GradeNm) {
      let gradeNm = grade.GradeNm;
      if (grade.GradeNm == "D-" || grade.GradeNm == "D+") {
        gradeNm = "D";
      }

      if (gradeNm in letterGrades || PNP.has(gradeNm)) {
        if (gradeNm in possible_grades) {
          possible_grades[gradeNm] += grade.EnrollmentCnt;
        } else {
          possible_grades[gradeNm] = grade.EnrollmentCnt;
        }
        if (gradeNm in letterGrades) {
          gpaSum += (grade.EnrollmentCnt * letterGrades[grade.GradeNm as keyof typeof letterGrades]);
          letterGradeCount += grade.EnrollmentCnt;
        }
        totalEnrolled += grade.EnrollmentCnt;
      }
    }
  })

  return {possible_grades, totalEnrolled, letterGradeCount, gpaSum};
}

function updateGradeSchema(gradesResponse: GradeModule.Grade, possible_grades: { [key: string]: number }, totalEnrolled: number, letterGradeCount: number): GradeModule.Grade {
  let starting_percentile = 1;
  Object.keys(possible_grades).map((grade) => {
    let keyInGradeResponse = grade.replace("+", "Plus").replace("-", "Minus");
    if (grade === "Pass") {
      keyInGradeResponse = "P";
    }
    if (grade === "Not Pass") {
      keyInGradeResponse = "NP";
    }

    const percentage = possible_grades[grade] / totalEnrolled;
    const gradeResponse = gradesResponse[keyInGradeResponse as keyof GradeModule.Grade] as GradeModule.LetterGrade;
    if (grade in letterGrades) {
      const percentile = possible_grades[grade] / letterGradeCount;
      const percentile_low = starting_percentile - percentile;
      gradeResponse.percent = round(percentage, 2);
      gradeResponse.numerator = possible_grades[grade];
      gradeResponse.percentile_high = round(starting_percentile, 2);
      gradeResponse.percentile_low = percentile_low < 0 ? 0 : round(percentile_low, 2);
      starting_percentile = percentile_low;
    } else {
      gradeResponse.percent = round(percentage, 2);
      gradeResponse.numerator = possible_grades[grade];
      gradeResponse.percentile_high = 0;
      gradeResponse.percentile_low = 0;
    }
  })
  return gradesResponse;
}

function round(value: number, decimals: number) {
  decimals = 10 ** decimals;
  return Math.round(value * decimals) / decimals;
}

function initializeGradeSchema(averageGPA: number, totalEnrolled: number): GradeModule.Grade {
  const gradesResponse: GradeModule.Grade = {
    APlus: {percent: 0, numerator: 0, percentile_high: 0, percentile_low: 0},
    A: {percent: 0, numerator: 0, percentile_high: 0, percentile_low: 0},
    AMinus: {percent: 0, numerator: 0, percentile_high: 0, percentile_low: 0},
    BPlus: {percent: 0, numerator: 0, percentile_high: 0, percentile_low: 0},
    B: {percent: 0, numerator: 0, percentile_high: 0, percentile_low: 0},
    BMinus: {percent: 0, numerator: 0, percentile_high: 0, percentile_low: 0},
    CPlus: {percent: 0, numerator: 0, percentile_high: 0, percentile_low: 0},
    C: {percent: 0, numerator: 0, percentile_high: 0, percentile_low: 0},
    CMinus: {percent: 0, numerator: 0, percentile_high: 0, percentile_low: 0},
    D: {percent: 0, numerator: 0, percentile_high: 0, percentile_low: 0},
    F: {percent: 0, numerator: 0, percentile_high: 0, percentile_low: 0},
    P: {percent: 0, numerator: 0, percentile_high: 0, percentile_low: 0},
    NP: {percent: 0, numerator: 0, percentile_high: 0, percentile_low: 0},
    section_gpa: averageGPA,
    section_letter: gpaToGrade(averageGPA),
    denominator: totalEnrolled
  };

  return gradesResponse;
}

function gpaToGrade(gpa: number) {
  if (gpa >= 4.0) {
    return "A+";
  } else if (gpa >= 3.7) {
    return "A-";
  } else if (gpa >= 3.3) {
    return "B+";
  } else if (gpa >= 3.0) {
    return "B";
  } else if (gpa >= 2.7) {
    return "B-";
  } else if (gpa >= 2.3) {
    return "C+";
  } else if (gpa >= 2.0) {
    return "C";
  } else if (gpa >= 1.7) {
    return "C-";
  } else if (gpa >= 1.3) {
    return "D+";
  } else if (gpa >= 1.0) {
    return "D";
  } else if (gpa >= 0.7) {
    return "D-";
  } else {
    return "F";
  }
}