// @ts-nocheck
import { GradeModel } from "../../db/grade";
import { Term } from "../../generated-types/graphql";
import { omitBy, isNil, sum } from "lodash";
import { GraphQLError } from "graphql";

const calanswersToLetter = {
  "A+": "A+",
  "A": "A",
  "A-": "A-",
  "B+": "B+",
  "B": "B",
  "B-": "B-",
  "C+": "C+",
  "C": "C",
  "C-": "C-",
  "D+": "D+",
  "D": "D",
  "D-": "D-",
  "F": "F",
  "Pass": "P",
  "Not Pass": "NP",
}

const letterWeights = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D": 1.0,
  "D-": 0.7,
  "F": 0
}

export async function getCombinedGrades(subject: string, courseNum: string, sectionNum?: string | null, term?: Term | null) {
  const grades = await GradeModel.find(omitBy({
    "CourseSubjectShortNm": subject,
    "CourseNumber": courseNum,
    "SectionNbr": sectionNum,
    "term.year": term?.year,
    "term.semester": term?.semester,
  }, isNil), { GradeNm: 1, EnrollmentCnt: 1 })

  if (grades.length == 0) {
    throw new GraphQLError(`No grades found for the specified class.`)
  }

  return {
    average: await getAverage(grades),
    distribution: await getDistribution(grades),
  }
}

export async function getDistribution(grades) {
  // distribution is a map of letter -> count
  let distribution = Object.values(calanswersToLetter)
    .reduce((acc, letter) => ({ ...acc, [letter]: 0 }), {});
  
  for (const grade of grades) {
    if (grade.GradeNm != undefined && grade.GradeNm in calanswersToLetter) {
      const letter = calanswersToLetter[grade.GradeNm]; 
      distribution[letter] += grade.EnrollmentCnt;
    }
  }

  return Object.entries(distribution).map(([letter, count]) => ({ letter, count: count as number }));
}

export async function getAverage(grades) {
  const total = sum(grades.map(g => g.GradeNm in letterWeights ? g.EnrollmentCnt : 0));
  const totalWeighted = sum(grades.map(g => g.EnrollmentCnt * (g.GradeNm in letterWeights ? letterWeights[g.GradeNm] : 0)));

  return total > 0 ? totalWeighted / total : null;
}
