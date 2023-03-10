import { GradeModel, GradeType } from "../../db/grade";
import { Term } from "../../generated-types/graphql";
import { omitBy, isNil, sum } from "lodash";
import { GraphQLError } from "graphql";

const calanswersToLetter: { [key: string]: string } = {
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

const letterWeights: { [key: string]: number } = {
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

export async function getDistribution(grades: GradeType[]) {
  // distribution is a map of letter -> count
  const distribution: { [key: string]: number } = Object.values(calanswersToLetter)
    .reduce((acc, letter) => ({ ...acc, [letter]: 0 }), {});

  for (const g of grades) {
    const name = g.GradeNm as string;
    const count = g.EnrollmentCnt as number;

    if (name in calanswersToLetter) {
      const letter = calanswersToLetter[name];
      distribution[letter] += count;
    }
  }

  return Object.entries(distribution).map(([letter, count]) => ({ letter, count }));
}

export async function getAverage(grades: GradeType[]) {
  let total = 0
  let totalWeighted = 0

  for (const g of grades) {
    const name = g.GradeNm as string;
    const count = g.EnrollmentCnt as number;

    if (name in letterWeights) {
      total += count;
      totalWeighted += count * letterWeights[name];
    }
  }

  return total > 0 ? totalWeighted / total : null;
}
