import {
  CourseModel,
  CuratedClassModel,
  IClassItem,
  ICourseItem,
  UserType,
} from "@repo/common";

import {
  CreateCuratedClassInput,
  UpdateCuratedClassInput,
} from "../../generated-types/graphql";
import { getClass } from "../class/controller";
import { formatClass } from "../class/formatter";
import { ClassModule } from "../class/generated-types/module-types";
import { formatCourse } from "../course/formatter";
import { CuratedClassesModule } from "./generated-types/module-types";

export const getCuratedClasses = async () => {
  const curatedClasses = await CuratedClassModel.find().lean();

  const uniqueClasses = curatedClasses.reduce(
    (acc, curatedClass) => {
      const key = `${curatedClass.year}-${curatedClass.semester}-${curatedClass.sessionId}-${curatedClass.subject}-${curatedClass.courseNumber}-${curatedClass.number}`;
      acc[key] = curatedClass;
      return acc;
    },
    {} as Record<string, (typeof curatedClasses)[0]>
  );

  // TODO: Optimize with batch request
  const classes = (
    await Promise.all(
      Object.values(uniqueClasses).map((curatedClass) =>
        getClass(
          curatedClass.year,
          curatedClass.semester,
          curatedClass.sessionId,
          curatedClass.subject,
          curatedClass.courseNumber,
          curatedClass.number
        )
      )
    )
  ).filter((cls) => cls !== null);

  // Filtering by identifiers reduces the amount of data returned for courses and sections
  const courseIds = classes.map((_class) => _class.courseId);

  // Fetch available courses for the term
  const courses = await CourseModel.find({
    courseId: { $in: courseIds },
    printInCatalog: true,
  }).lean();

  // Fetch available sections for the term
  // const sections = await SectionModel.find({
  //   courseId: { $in: courseIds },
  //   printInScheduleOfClasses: true,
  // }).lean();

  // const parsedGradeDistributions = {} as Record<
  //   string,
  //   GradeDistributionModule.GradeDistribution
  // >;

  // const children = getFields(info.fieldNodes);
  // const includesGradeDistribution = children.includes("gradeDistribution");

  // if (includesGradeDistribution) {
  //   const sectionIds = sections.map((section) => section.sectionId);

  //   const gradeDistributions = await GradeDistributionModel.find({
  //     // The bottleneck seems to be the amount of data we are fetching and not the query itself
  //     sectionId: { $in: sectionIds },
  //   }).lean();

  //   const reducedGradeDistributions = gradeDistributions.reduce(
  //     (accumulator, gradeDistribution) => {
  //       const courseSubjectNumber = `${gradeDistribution.subject}-${gradeDistribution.courseNumber}`;
  //       const sectionId = gradeDistribution.sectionId;

  //       accumulator[courseSubjectNumber] = accumulator[courseSubjectNumber]
  //         ? [...accumulator[courseSubjectNumber], gradeDistribution]
  //         : [gradeDistribution];
  //       accumulator[sectionId] = accumulator[sectionId]
  //         ? [...accumulator[sectionId], gradeDistribution]
  //         : [gradeDistribution];

  //       return accumulator;
  //     },
  //     {} as Record<string, IGradeDistributionItem[]>
  //   );

  //   const entries = Object.entries(reducedGradeDistributions);

  //   for (const [key, value] of entries) {
  //     const distribution = getDistribution(value);

  //     parsedGradeDistributions[key] = {
  //       average: getAverageGrade(distribution),
  //       distribution,
  //     } as GradeDistributionModule.GradeDistribution;
  //   }
  // }

  // Turn courses into a map to decrease time complexity for filtering
  const reducedCourses = courses.reduce(
    (accumulator, course) => {
      accumulator[course.courseId] = course as ICourseItem;
      return accumulator;
    },
    {} as Record<string, ICourseItem>
  );

  // Turn sections into a map to decrease time complexity for filtering
  // const reducedSections = sections.reduce(
  //   (accumulator, section) => {
  //     const courseId = section.courseId;
  //     const classNumber = section.classNumber;

  //     const id = `${courseId}-${classNumber}`;

  //     accumulator[id] = (
  //       accumulator[id] ? [...accumulator[id], section] : [section]
  //     ) as ISectionItem[];

  //     return accumulator;
  //   },
  //   {} as Record<string, ISectionItem[]>
  // );

  const reducedClasses = curatedClasses.reduce((accumulator, curatedClass) => {
    const _class = classes.find(
      (c) =>
        c.year === curatedClass.year &&
        c.semester === curatedClass.semester &&
        c.sessionId === curatedClass.sessionId &&
        c.subject === curatedClass.subject &&
        c.number === curatedClass.number &&
        c.courseNumber === curatedClass.courseNumber
    );
    if (!_class) return accumulator;

    const courseId = _class.courseId;

    const course = reducedCourses[courseId];
    if (!course) return accumulator;

    // const sections = reducedSections[`${courseId}-${_class.number}`];
    // if (!sections) return accumulator;

    // const index = sections.findIndex((section) => section.primary);
    // if (index === -1) return accumulator;

    // const formattedPrimarySection = formatSection(sections.splice(index, 1)[0]);
    // const formattedSections = sections.map(formatSection);

    const formattedCourse = formatCourse(
      course
    ) as unknown as ClassModule.Course;

    // Add grade distribution to course
    // if (includesGradeDistribution) {
    //   const key = `${course.subject}-${course.number}`;
    //   const gradeDistribution = parsedGradeDistributions[key];

    //   // Fall back to an empty grade distribution to prevent resolving the field again
    //   formattedCourse.gradeDistribution = gradeDistribution ?? {
    //     average: null,
    //     distribution: [],
    //   };
    // }

    const formattedClass = {
      ...formatClass(_class as IClassItem),
      // primarySection: formattedPrimarySection,
      // sections: formattedSections,
      course: formattedCourse,
    } as unknown as ClassModule.Class;

    // Add grade distribution to class
    // if (includesGradeDistribution) {
    //   const sectionId = formattedPrimarySection.sectionId;

    //   // Fall back to an empty grade distribution to prevent resolving the field again
    //   const gradeDistribution = parsedGradeDistributions[sectionId] ?? {
    //     average: null,
    //     distribution: [],
    //   };

    //   formattedClass.gradeDistribution = gradeDistribution;
    // }

    accumulator.push({
      ...curatedClass,
      class: formattedClass,
    } as unknown as CuratedClassesModule.CuratedClass);

    return accumulator;
  }, [] as CuratedClassesModule.CuratedClass[]);

  return reducedClasses.toSorted((a, b) =>
    a.publishedAt && b.publishedAt
      ? String(b.publishedAt).localeCompare(String(a.publishedAt))
      : String(a.updatedAt).localeCompare(String(b.updatedAt))
  );
};

export const getCuratedClass = async (
  context: { user?: UserType },
  id: string
) => {
  if (!context.user?.staff) throw new Error("Unauthorized");

  const curatedClass = await CuratedClassModel.findOne({
    _id: id,
  });

  if (!curatedClass) throw new Error("Not found");

  return curatedClass;
};

export const updateCuratedClass = async (
  context: { user?: UserType },
  id: string,
  input: UpdateCuratedClassInput
) => {
  if (!context.user?.staff) throw new Error("Unauthorized");

  const curatedClass = await CuratedClassModel.findOneAndUpdate(
    {
      _id: id,
    },
    input,
    { new: true }
  );
  if (!curatedClass) throw new Error("Not found");

  return curatedClass;
};

export const deleteCuratedClass = async (
  context: { user?: UserType },
  id: string
) => {
  if (!context.user?.staff) throw new Error("Unauthorized");

  const curatedClass = await CuratedClassModel.findOneAndDelete({
    _id: id,
  });
  if (!curatedClass) throw new Error("Not Found");

  return id;
};

export const createCuratedClass = async (
  context: { user?: UserType },
  input: CreateCuratedClassInput
) => {
  if (!context.user?.staff) throw new Error("Unauthorized");

  const curatedClass = await CuratedClassModel.create({
    ...input,
    createdBy: context.user._id,
    publishedAt: new Date(),
  });

  return curatedClass;
};
