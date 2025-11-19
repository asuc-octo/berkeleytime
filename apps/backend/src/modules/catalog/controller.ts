import { GraphQLResolveInfo } from "graphql";

import {
  ClassModel,
  CourseModel,
  GradeDistributionModel,
  IClassItem,
  ICourseItem,
  IGradeDistributionItem,
  ISectionItem,
  NewEnrollmentHistoryModel,
  SectionModel,
  TermModel,
} from "@repo/common";
import { getFields } from "../../utils/graphql";
import { formatClass, formatSection } from "../class/formatter";
import { ClassModule } from "../class/generated-types/module-types";
import { formatCourse } from "../course/formatter";
import { formatEnrollment } from "../enrollment/formatter";
import { EnrollmentModule } from "../enrollment/generated-types/module-types";
import {
  getAverageGrade,
  getDistribution,
  getPnpPercentage,
} from "../grade-distribution/controller";
import { GradeDistributionModule } from "../grade-distribution/generated-types/module-types";

// TODO: Pagination, filtering
export const getCatalog = async (
  year: number,
  semester: string,
  info: GraphQLResolveInfo
) => {
  const term = await TermModel.findOne({
    name: `${year} ${semester}`,
  })
    .select({ _id: 1 })
    .lean();

  if (!term) throw new Error("Invalid term");

  /**
   * TODO:
   * Basic pagination can be introduced by using skip and limit
   * However, because filtering requires access to all three collections,
   * we cannot paginate the MongoDB queries themselves while filtering
   * course or section fields
   *
   * We can optimize filtering by applying skip and limit to the classes
   * query when only filtering by class fields, and then fall back to
   * in-memory filtering for fields from courses and sections
   */

  // Fetch available classes for the term
  const classes = await ClassModel.find({
    year,
    semester,
    anyPrintInScheduleOfClasses: true,
  }).lean();

  // Filtering by identifiers reduces the amount of data returned for courses and sections
  const courseIds = classes.map((_class) => _class.courseId);

  // Fetch available courses for the term
  const courses = await CourseModel.find({
    courseId: { $in: courseIds },
    printInCatalog: true,
  }).lean();

  // Fetch available sections for the term
  const sections = await SectionModel.find({
    year,
    semester,
    courseId: { $in: courseIds },
    printInScheduleOfClasses: true,
  }).lean();

  let parsedGradeDistributions = {} as Record<
    string,
    GradeDistributionModule.GradeDistribution
  >;

  const children = getFields(info.fieldNodes);
  const includesGradeDistribution = children.includes("gradeDistribution");

  if (includesGradeDistribution) {
    const sectionIds = sections.map((section) => section.sectionId);

    // Get class-level grade distributions (current semester only)
    const classGradeDistributions = await GradeDistributionModel.find({
      sectionId: { $in: sectionIds },
    }).lean();

    // Get course-level grade distributions (all semesters/history)
    // Include both the cross-listed parent courses AND the classes themselves
    const courseGradeDistributions = await GradeDistributionModel.find({
      $or: [
        ...courses.map((course) => ({
          subject: course.subject,
          courseNumber: course.number,
        })),
        ...classes.map((_class) => ({
          subject: _class.subject,
          courseNumber: _class.courseNumber,
        })),
      ],
    }).lean();

    // Separate processing for class-level and course-level distributions
    const reducedGradeDistributions = {} as Record<
      string,
      GradeDistributionModule.GradeDistribution
    >;

    // Process class-level distributions (by sectionId)
    const classBySection = classGradeDistributions.reduce(
      (acc, gradeDistribution) => {
        const sectionId = gradeDistribution.sectionId;
        acc[sectionId] = acc[sectionId]
          ? [...acc[sectionId], gradeDistribution]
          : [gradeDistribution];
        return acc;
      },
      {} as Record<string, IGradeDistributionItem[]>
    );

    for (const [sectionId, distributions] of Object.entries(classBySection)) {
      const distribution = getDistribution(distributions);
      reducedGradeDistributions[sectionId] = {
        average: getAverageGrade(distribution),
        distribution,
        pnpPercentage: getPnpPercentage(distribution),
      } as GradeDistributionModule.GradeDistribution;
    }

    // Process course-level distributions (by subject-number, all history)
    const courseByCourse = courseGradeDistributions.reduce(
      (acc, gradeDistribution) => {
        const key = `${gradeDistribution.subject}-${gradeDistribution.courseNumber}`;
        acc[key] = acc[key]
          ? [...acc[key], gradeDistribution]
          : [gradeDistribution];
        return acc;
      },
      {} as Record<string, IGradeDistributionItem[]>
    );

    for (const [key, distributions] of Object.entries(courseByCourse)) {
      const distribution = getDistribution(distributions);
      reducedGradeDistributions[key] = {
        average: getAverageGrade(distribution),
        distribution,
        pnpPercentage: getPnpPercentage(distribution),
      } as GradeDistributionModule.GradeDistribution;
    }

    parsedGradeDistributions = reducedGradeDistributions;
  }

  // Batch-fetch enrollment data to avoid N+1 queries
  let enrollmentMap = {} as Record<string, EnrollmentModule.Enrollment | null>;

  const includesEnrollment = children.includes("enrollment");

  if (includesEnrollment) {
    const sectionIds = sections.map((section) => section.sectionId);

    // Batch fetch all enrollment records for the term
    const enrollments = await NewEnrollmentHistoryModel.find({
      termId: term._id,
      sectionId: { $in: sectionIds },
    }).lean();

    // Build lookup map by sectionId
    enrollmentMap = enrollments.reduce(
      (acc, enrollment) => {
        acc[enrollment.sectionId] = formatEnrollment(enrollment);
        return acc;
      },
      {} as Record<string, EnrollmentModule.Enrollment | null>
    );
  }

  // Turn courses into a map to decrease time complexity for filtering
  const reducedCourses = courses.reduce(
    (accumulator, course) => {
      accumulator[course.courseId] = course as ICourseItem;
      return accumulator;
    },
    {} as Record<string, ICourseItem>
  );

  // Turn sections into a map to decrease time complexity for filtering
  const reducedSections = sections.reduce(
    (accumulator, section) => {
      const courseId = section.courseId;
      const classNumber = section.classNumber;

      const id = `${courseId}-${classNumber}`;

      accumulator[id] = (
        accumulator[id] ? [...accumulator[id], section] : [section]
      ) as ISectionItem[];

      return accumulator;
    },
    {} as Record<string, ISectionItem[]>
  );

  const reducedClasses = classes.reduce((accumulator, _class) => {
    const courseId = _class.courseId;

    const course = reducedCourses[courseId];
    if (!course) return accumulator;

    const sections = reducedSections[`${courseId}-${_class.number}`];
    if (!sections) return accumulator;

    const index = sections.findIndex((section) => section.primary);
    if (index === -1) return accumulator;

    const primarySection = sections.splice(index, 1)[0];
    const formattedPrimarySection = formatSection(
      primarySection,
      includesEnrollment ? enrollmentMap[primarySection.sectionId] : undefined
    );
    const formattedSections = sections.map((section) =>
      formatSection(
        section,
        includesEnrollment ? enrollmentMap[section.sectionId] : undefined
      )
    );

    const formattedCourse = formatCourse(
      course
    ) as unknown as ClassModule.Course;

    // Add grade distribution to course
    // Use the class's subject and courseNumber to get the correct grades for cross-listed courses
    if (includesGradeDistribution) {
      const key = `${_class.subject}-${_class.courseNumber}`;
      const gradeDistribution = parsedGradeDistributions[key];

      // Fall back to an empty grade distribution to prevent resolving the field again
      formattedCourse.gradeDistribution = gradeDistribution ?? {
        average: null,
        distribution: [],
        pnpPercentage: null,
      };
    }

    const formattedClass = {
      ...formatClass(_class as IClassItem),
      primarySection: formattedPrimarySection,
      sections: formattedSections,
      course: formattedCourse,
    } as unknown as ClassModule.Class;

    // Add grade distribution to class
    if (includesGradeDistribution) {
      const sectionId = formattedPrimarySection.sectionId;

      // Fall back to an empty grade distribution to prevent resolving the field again
      const gradeDistribution = parsedGradeDistributions[sectionId] ?? {
        average: null,
        distribution: [],
        pnpPercentage: null,
      };

      formattedClass.gradeDistribution = gradeDistribution;
    }

    accumulator.push(formattedClass);
    return accumulator;
  }, [] as ClassModule.Class[]);

  return reducedClasses;
};
