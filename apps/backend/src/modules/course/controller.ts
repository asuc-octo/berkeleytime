import {
  ClassModel,
  CourseModel,
  IClassItem,
  ICourseItem,
} from "@repo/common/models";

import { buildSubjectQuery } from "../../utils/subject";
import { formatClass } from "../class/formatter";
import { IntermediateCourse, formatCourse } from "./formatter";
import { CourseModule } from "./generated-types/module-types";

const buildFormerNamesByCourseId = async () => {
  const classNames = await ClassModel.aggregate<{
    _id: string;
    names: string[];
  }>([
    {
      $group: {
        _id: "$courseId",
        names: { $addToSet: { $concat: ["$subject", " ", "$courseNumber"] } },
      },
    },
  ]);

  const currentCourses = await CourseModel.find(
    { printInCatalog: true },
    { subject: 1, number: 1 }
  ).lean();

  const currentCourseNames = new Set(
    currentCourses.map((c) => `${c.subject} ${c.number}`)
  );

  return new Map(
    classNames.map(({ _id, names }) => [
      _id,
      names.filter((name) => !currentCourseNames.has(name)),
    ])
  );
};

const FORMER_NAMES_CACHE_TTL_MS = 5 * 60 * 1000;

interface FormerNamesCacheEntry {
  promise: Promise<Map<string, string[]>>;
  expiresAt: number;
}

let formerNamesByCourseIdCache: FormerNamesCacheEntry | null = null;

export const getFormerNamesByCourseId = () => {
  const now = Date.now();

  if (
    formerNamesByCourseIdCache &&
    now < formerNamesByCourseIdCache.expiresAt
  ) {
    return formerNamesByCourseIdCache.promise;
  }

  const entry: FormerNamesCacheEntry = {
    promise: buildFormerNamesByCourseId(),
    expiresAt: now + FORMER_NAMES_CACHE_TTL_MS,
  };
  formerNamesByCourseIdCache = entry;

  void entry.promise.catch(() => {
    if (formerNamesByCourseIdCache === entry) {
      formerNamesByCourseIdCache = null;
    }
  });

  return entry.promise;
};

export const getCourse = async (subject: string, number: string) => {
  const course = await CourseModel.findOne({
    subject: buildSubjectQuery(subject),
    number,
  })
    .sort({ fromDate: -1 })
    .lean();

  if (!course) return null;

  const formerNamesByCourseId = await getFormerNamesByCourseId();

  return {
    ...formatCourse(course as ICourseItem),
    formerNames: formerNamesByCourseId.get(course.courseId) ?? [],
  };
};

export const getCourseById = async (
  courseId: string,
  preferredSubject?: string,
  preferredNumber?: string
) => {
  // If preferred subject and number are provided, try to find exact match first
  if (preferredSubject && preferredNumber) {
    const exactMatch = await CourseModel.findOne({
      courseId,
      subject: preferredSubject,
      number: preferredNumber,
    })
      .sort({ fromDate: -1 })
      .lean();

    if (exactMatch) {
      const formerNamesByCourseId = await getFormerNamesByCourseId();

      return {
        ...formatCourse(exactMatch as ICourseItem),
        formerNames: formerNamesByCourseId.get(courseId) ?? [],
      };
    }
  }

  // Fall back to any course with the courseId
  const course = await CourseModel.findOne({ courseId })
    .sort({ fromDate: -1 })
    .lean();

  if (!course) return null;

  const formerNamesByCourseId = await getFormerNamesByCourseId();

  return {
    ...formatCourse(course as ICourseItem),
    formerNames: formerNamesByCourseId.get(courseId) ?? [],
  };
};

interface GetClassesByCourseOptions {
  printInScheduleOnly?: boolean;
  limit?: number;
}

const semesterRecencySortExpression = {
  $switch: {
    branches: [
      { case: { $eq: ["$semester", "Spring"] }, then: 0 },
      { case: { $eq: ["$semester", "Summer"] }, then: 1 },
      { case: { $eq: ["$semester", "Fall"] }, then: 2 },
      { case: { $eq: ["$semester", "Winter"] }, then: -1 },
    ],
    default: -1,
  },
};

export const getClassesByCourse = async (
  courseId: string,
  { printInScheduleOnly = false, limit }: GetClassesByCourseOptions = {}
) => {
  const query: Record<string, unknown> = { courseId };
  if (printInScheduleOnly) {
    query.anyPrintInScheduleOfClasses = { $ne: false };
  }

  if (typeof limit === "number" && limit > 0) {
    const classes = await ClassModel.aggregate([
      { $match: query },
      {
        $addFields: {
          __semesterSortOrder: semesterRecencySortExpression,
        },
      },
      { $sort: { year: -1, __semesterSortOrder: -1, number: -1 } },
      { $limit: limit },
      { $project: { __semesterSortOrder: 0 } },
    ]);

    return classes.map((_class) => formatClass(_class as IClassItem));
  }

  const classQuery = ClassModel.find(query);
  const classes = await classQuery.lean();

  return classes.map((_class) => formatClass(_class as IClassItem));
};

export const getAssociatedCoursesBySubjectNumber = async (
  courses: string[]
) => {
  const queries = courses.map((course) => {
    const split = course.split(" ");

    const subject = split.slice(0, -1).join(" ");
    const number = split[split.length - 1];

    return {
      subject,
      number,
    };
  });

  const associatedCourses = await CourseModel.find({
    $or: queries,
  })
    .sort({ fromDate: -1 })
    .lean();

  return (
    associatedCourses
      // TODO: Properly filter out duplicates in the query
      .filter(
        (course, index) =>
          associatedCourses.findIndex(
            (associatedCourse) =>
              associatedCourse.subject === course.subject &&
              course.number === associatedCourse.number
          ) === index
      )
      .map((course) => formatCourse(course as ICourseItem))
  );
};

export const getAssociatedCoursesById = async (courseIds: string[]) => {
  const associatedCourses = await CourseModel.find({
    courseId: { $in: courseIds },
  })
    .sort({ fromDate: -1 })
    .lean();

  return associatedCourses.map((course) => formatCourse(course as ICourseItem));
};

// TODO: Grade distributions
export const getCourses = async () => {
  const courses = await CourseModel.aggregate([
    {
      $match: {
        printInCatalog: true,
      },
    },
    {
      $sort: {
        subject: 1,
        number: 1,
        fromDate: -1,
      },
    },
    // {
    //   $group: {
    //     _id: "$displayName",
    //     document: { $first: "$$ROOT" },
    //   },
    // },
    // {
    //   $replaceRoot: { newRoot: "$document" },
    // },
  ]);

  // /* Map grades to course keys for easy lookup */
  // const gradesMap: { [key: string]: GradeType[] } = {};
  // courses.forEach((c) => (gradesMap[getCourseKey(c)] = []));

  // const children = getChildren(info);

  // if (children.includes("gradeAverage")) {
  //   const grades = await GradeModel.find(
  //     {
  //       /*
  //                   No filters because an appropriately large filter
  //                   is actually significantly slower than no filter.
  //               */
  //     },
  //     {
  //       CourseSubjectShortNm: 1,
  //       CourseNumber: 1,
  //       GradeNm: 1,
  //       EnrollmentCnt: 1,
  //     }
  //   ).lean();

  //   for (const g of grades) {
  //     const key = `${g.CourseSubjectShortNm as string} ${
  //       g.CourseNumber as string
  //     }`;
  //     if (key in gradesMap) {
  //       gradesMap[key].push(g);
  //     }
  //   }
  // }

  const formerNamesByCourseId = await getFormerNamesByCourseId();

  return courses.map((c) => ({
    ...formatCourse(c),
    gradeDistribution: null,
    formerNames: formerNamesByCourseId.get(c.courseId) ?? [],
  })) as (Exclude<IntermediateCourse, "gradeDistribution"> & {
    gradeDistribution: CourseModule.Course["gradeDistribution"];
  })[];
};
