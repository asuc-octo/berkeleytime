import Fuse from "fuse.js";
import { GraphQLResolveInfo } from "graphql";

import {
  ClassModel,
  CourseModel,
  GradeDistributionModel,
  IClassItem,
  ICourseItem,
  IGradeDistributionItem,
  ISectionItem,
  SectionModel,
  TermModel,
} from "@repo/common";
import { subjects } from "@repo/shared";

import { getFields } from "../../utils/graphql";
import { formatClass, formatSection } from "../class/formatter";
import { ClassModule } from "../class/generated-types/module-types";
import { formatCourse } from "../course/formatter";
import {
  getAverageGrade,
  getDistribution,
  getPnpPercentage,
} from "../grade-distribution/controller";
import { GradeDistributionModule } from "../grade-distribution/generated-types/module-types";

export const getIndex = (classes: ClassModule.Class[]) => {
  const list = classes.map((_class) => {
    const { title, subject, number } = _class.course;

    // For prefixed courses, prefer the number and add an abbreviation with the prefix
    const containsPrefix = /^[a-zA-Z].*/.test(number);
    const alternateNumber = number.slice(1);

    const term = subject.toLowerCase();

    const alternateNames = subjects[term]?.abbreviations.reduce(
      (acc, abbreviation) => {
        // Add alternate names for abbreviations
        const abbreviations = [
          `${abbreviation}${number}`,
          `${abbreviation} ${number}`,
        ];

        if (containsPrefix) {
          abbreviations.push(
            `${abbreviation}${alternateNumber}`,
            `${abbreviation} ${alternateNumber}`
          );
        }

        return [...acc, ...abbreviations];
      },
      // Add alternate names
      containsPrefix
        ? [
            `${subject}${number}`,
            `${subject} ${alternateNumber}`,
            `${subject}${alternateNumber}`,
          ]
        : [`${subject}${number}`]
    );

    return {
      title: _class.title ?? title,
      // subject,
      // number,
      name: `${subject} ${number}`,
      alternateNames,
    };
  });

  // Attempt to increase performance by dropping unnecessary fields
  const options = {
    includeScore: true,
    // ignoreLocation: true,
    threshold: 0.25,
    keys: [
      // { name: "number", weight: 1.2 },
      "name",
      "title",
      {
        name: "alternateNames",
        weight: 2,
      },
      // { name: "subject", weight: 1.5 },
    ],
    // TODO: Fuse types are wrong for sortFn
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // sortFn: (a: any, b: any) => {
    //   // First, sort by score
    //   if (a.score - b.score) return a.score - b.score;

    //   // Otherwise, sort by number
    //   return a.item[0].v.toLowerCase().localeCompare(b.item[0].v.toLowerCase());
    // },
  };

  return new Fuse(list, options);
};

// TODO: Pagination, filtering
export const getCatalog = async (
  year: number,
  semester: string,
  info: GraphQLResolveInfo,
  query?: string | null
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

    const formattedPrimarySection = formatSection(sections.splice(index, 1)[0]);
    const formattedSections = sections.map(formatSection);

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

  query = query?.trim();

  if (query) {
    const index = getIndex(reducedClasses);

    // TODO: Limit query because Fuse performance decreases linearly by
    // n (field length) * m (pattern length) * l (maximum Levenshtein distance)
    const filteredClasses = index
      .search(query)
      .map(({ refIndex }) => reducedClasses[refIndex]);

    return filteredClasses;
  }

  return reducedClasses;
};
