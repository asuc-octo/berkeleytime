import {
  GradeDistributionModel,
  IGradeDistributionItem,
  NewSectionModel,
} from "@repo/common";

enum Letter {
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

interface Grade {
  letter: Letter;
  percentage: number;
  count: number;
}

export const getDistribution = (distributions: IGradeDistributionItem[]) => {
  const distribution = distributions.reduce(
    (
      acc,
      {
        countA,
        countAMinus,
        countAPlus,
        countB,
        countBMinus,
        countBPlus,
        countC,
        countCMinus,
        countCPlus,
        countD,
        countDMinus,
        countDPlus,
        countF,
        countNP,
        countP,
        countU,
        countS,
      }
    ) => {
      acc.countA += countA;
      acc.countAMinus += countAMinus;
      acc.countAPlus += countAPlus;
      acc.countB += countB;
      acc.countBMinus += countBMinus;
      acc.countBPlus += countBPlus;
      acc.countC += countC;
      acc.countCMinus += countCMinus;
      acc.countCPlus += countCPlus;
      acc.countD += countD;
      acc.countDMinus += countDMinus;
      acc.countDPlus += countDPlus;
      acc.countF += countF;
      acc.countNP += countNP;
      acc.countP += countP;
      acc.countU += countU;
      acc.countS += countS;
      return acc;
    },
    {
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
      countU: 0,
      countS: 0,
    }
  );

  const total = Object.values(distribution).reduce((acc, count) => acc + count);

  return Object.entries(distribution).map(
    ([field, count]) =>
      ({
        letter: letters[field],
        percentage: count / total,
        count,
      }) as Grade
  );
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

export const getAverageGrade = (distribution: Grade[]) => {
  const total = distribution.reduce((acc, { letter, count }) => {
    if (Object.keys(points).includes(letter)) return acc + count;

    // Ignore letters not included in GPA
    return acc;
  }, 0);

  // For distributions without a GPA, return null
  if (total === 0) return null;

  const weightedTotal = distribution.reduce((acc, { letter, count }) => {
    if (Object.keys(points).includes(letter))
      return points[letter] * count + acc;

    return acc;
  }, 0);

  return weightedTotal / total;
};

export const getGradeDistributionByCourse = async (
  subject: string,
  number: string
) => {
  const distributions = await GradeDistributionModel.find({
    subject,
    courseNumber: number,
  });

  // if (distributions.length === 0)
  //   throw new Error("No grade distributions found");

  const distribution = getDistribution(distributions);

  return {
    average: getAverageGrade(distribution),
    distribution,
  };
};

export const getGradeDistributionByClass = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  sectionNumber: string
) => {
  const section = await NewSectionModel.findOne({
    year,
    semester,
    sessionId: sessionId ? sessionId : "1",
    subject,
    courseNumber,
    number: sectionNumber,
    primary: true,
  })
    .select({ sectionId: 1 })
    .lean();

  if (!section) throw new Error("Class not found");

  const distributions = await GradeDistributionModel.find({
    subject,
    courseNumber,
    sectionId: section.sectionId,
  });

  // if (distributions.length === 0)
  //   throw new Error("No grade distributions found");

  const distribution = getDistribution(distributions);

  return {
    average: getAverageGrade(distribution),
    distribution,
  };
};

export const getGradeDistributionBySemester = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string
) => {
  const distributions = await GradeDistributionModel.find({
    year,
    semester,
    sessionId: sessionId ? sessionId : "1",
    subject,
    courseNumber,
  });

  // if (distributions.length === 0)
  //   throw new Error("No grade distributions found");

  const distribution = getDistribution(distributions);

  return {
    average: getAverageGrade(distribution),
    distribution,
  };
};

export const getGradeDistributionByInstructor = async (
  subject: string,
  courseNumber: string,
  familyName: string,
  givenName: string
) => {
  const sections = await NewSectionModel.find({
    subject,
    courseNumber,
    "meetings.instructors.familyName": familyName,
    "meetings.instructors.givenName": givenName,
    primary: true,
  })
    .select({ sectionId: 1 })
    .lean();

  if (sections.length === 0) throw new Error("No classes found");

  const sectionIds = sections.map((section) => section.sectionId);
  const distributions = await GradeDistributionModel.find({
    sectionId: { $in: sectionIds },
  });

  // if (distributions.length === 0)
  //   throw new Error("No grade distributions found");

  const distribution = getDistribution(distributions);

  return {
    average: getAverageGrade(distribution),
    distribution,
  };
};

export const getGradeDistributionByInstructorAndSemester = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string,
  familyName: string,
  givenName: string
) => {
  const sections = await NewSectionModel.find({
    year,
    semester,
    sessionId: sessionId ? sessionId : "1",
    subject,
    courseNumber,
    "meetings.instructors.familyName": familyName,
    "meetings.instructors.givenName": givenName,
    primary: true,
  })
    .select({ sectionId: 1 })
    .lean();

  if (sections.length === 0) throw new Error("No classes found");

  const sectionIds = sections.map((section) => section.sectionId);
  const distributions = await GradeDistributionModel.find({
    sectionId: { $in: sectionIds },
  });

  // if (distributions.length === 0)
  //   throw new Error("No grade distributions found");

  const distribution = getDistribution(distributions);

  return {
    average: getAverageGrade(distribution),
    distribution,
  };
};
