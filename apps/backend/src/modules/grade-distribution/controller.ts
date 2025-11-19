import {
  GradeDistributionModel,
  SectionModel,
  TermModel,
  getAverageGrade,
  getDistribution,
  getPnpPercentage,
} from "@repo/common";

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
    pnpPercentage: getPnpPercentage(distribution),
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
  const section = await SectionModel.findOne({
    year,
    semester,
    sessionId,
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
    pnpPercentage: getPnpPercentage(distribution),
  };
};

export const getGradeDistributionBySemester = async (
  year: number,
  semester: string,
  sessionId: string,
  subject: string,
  courseNumber: string
) => {
  const term = await TermModel.findOne({
    name: `${year} ${semester}`,
  })
    .select({ id: 1 })
    .lean();

  if (!term) throw new Error(`Term not found for ${year} ${semester}`);

  const distributions = await GradeDistributionModel.find({
    termId: term.id,
    sessionId,
    subject,
    courseNumber,
  });

  // if (distributions.length === 0)
  //   throw new Error("No grade distributions found");

  const distribution = getDistribution(distributions);

  return {
    average: getAverageGrade(distribution),
    distribution,
    pnpPercentage: getPnpPercentage(distribution),
  };
};

export const getGradeDistributionByInstructor = async (
  subject: string,
  courseNumber: string,
  familyName: string,
  givenName: string
) => {
  const sections = await SectionModel.find({
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
    pnpPercentage: getPnpPercentage(distribution),
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
  const sections = await SectionModel.find({
    year,
    semester,
    sessionId,
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
  const term = await TermModel.findOne({
    name: `${year} ${semester}`,
  })
    .select({ id: 1 })
    .lean();

  if (!term) throw new Error("Term not found");

  const distributions = await GradeDistributionModel.find({
    sectionId: { $in: sectionIds },
    termId: term.id,
    sessionId: sessionId,
  });

  if (distributions.length === 0) throw new Error("No grades found");

  const distribution = getDistribution(distributions);

  return {
    average: getAverageGrade(distribution),
    distribution,
    pnpPercentage: getPnpPercentage(distribution),
  };
};
