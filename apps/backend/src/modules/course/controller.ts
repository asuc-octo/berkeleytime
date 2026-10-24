import {
  type CourseListing,
  computeFormerNames,
  normalizeCourseNameKey,
  selectCourseListings,
} from "@repo/common";
import {
  ClassModel,
  CourseModel,
  IClassItem,
  ICourseItem,
} from "@repo/common/models";

import { buildSubjectQuery, normalizeSubject } from "../../utils/subject";
import { formatClass } from "../class/formatter";
import { IntermediateCourse, formatCourse } from "./formatter";
import { CourseModule } from "./generated-types/module-types";

export const getCourseListings = async (
  courseId: string,
  subject: string
): Promise<CourseListing[]> => {
  const [listings, catalogSubjects] = await Promise.all([
    ClassModel.aggregate<{ _id: CourseListing; termIds: string[] }>([
      { $match: { courseId } },
      {
        $group: {
          _id: { subject: "$subject", courseNumber: "$courseNumber" },
          termIds: { $addToSet: "$termId" },
        },
      },
    ]),
    CourseModel.distinct("subject", { courseId, printInCatalog: true }),
  ]);

  return selectCourseListings(
    listings.map(({ _id, termIds }) => ({ ..._id, termIds })),
    new Set(catalogSubjects.map(normalizeSubject)),
    subject
  ).map(({ subject, courseNumber }) => ({ subject, courseNumber }));
};

interface CourseIdentity {
  courseId: string;
  subject: string;
  number: string;
}

export const getCourseKey = ({ courseId, subject, number }: CourseIdentity) =>
  `${courseId} ${subject} ${number}`;

interface FormerNameIndex {
  formerNamesByCourse: Map<string, string[]>;
  courseByFormerNameKey: Map<string, CourseIdentity>;
}

const buildFormerNameIndex = async (): Promise<FormerNameIndex> => {
  const [listingRows, courses] = await Promise.all([
    ClassModel.aggregate<{
      _id: CourseListing & { courseId: string };
      termIds: string[];
    }>([
      {
        $group: {
          _id: {
            courseId: "$courseId",
            subject: "$subject",
            courseNumber: "$courseNumber",
          },
          termIds: { $addToSet: "$termId" },
        },
      },
    ]),
    CourseModel.find(
      {},
      { courseId: 1, subject: 1, number: 1, printInCatalog: 1 }
    ).lean(),
  ]);

  const results = computeFormerNames(
    listingRows.map(({ _id, termIds }) => ({ ..._id, termIds })),
    courses
  );

  const formerNamesByCourse = new Map<string, string[]>();
  const courseByFormerNameKey = new Map<string, CourseIdentity>();
  courses.forEach((course, index) => {
    const { formerNames, formerNameKeys } = results[index];
    const identity = {
      courseId: course.courseId,
      subject: course.subject,
      number: course.number,
    };
    formerNamesByCourse.set(getCourseKey(identity), formerNames);
    for (const key of formerNameKeys) courseByFormerNameKey.set(key, identity);
  });

  return { formerNamesByCourse, courseByFormerNameKey };
};

const FORMER_NAMES_CACHE_TTL_MS = 60 * 60 * 1000;

interface FormerNameIndexCacheEntry {
  promise: Promise<FormerNameIndex>;
  expiresAt: number;
}

let formerNameIndexCache: FormerNameIndexCacheEntry | null = null;

export const getFormerNameIndex = () => {
  const now = Date.now();

  if (formerNameIndexCache && now < formerNameIndexCache.expiresAt) {
    return formerNameIndexCache.promise;
  }

  const entry: FormerNameIndexCacheEntry = {
    promise: buildFormerNameIndex(),
    expiresAt: now + FORMER_NAMES_CACHE_TTL_MS,
  };
  formerNameIndexCache = entry;

  void entry.promise.catch(() => {
    if (formerNameIndexCache === entry) {
      formerNameIndexCache = null;
    }
  });

  return entry.promise;
};

export const getCourse = async (subject: string, number: string) => {
  const { formerNamesByCourse, courseByFormerNameKey } =
    await getFormerNameIndex();

  // Renamed courses (e.g. "EECS 16A" -> "ELENG 66") keep their classes under
  // one courseId, while the defunct name's own course entry has none. Former
  // names never collide with current courses, so resolve them first.
  const renamedCourse = courseByFormerNameKey.get(
    normalizeCourseNameKey(`${subject} ${number}`)
  );

  const course = await CourseModel.findOne(
    renamedCourse ?? { subject: buildSubjectQuery(subject), number }
  )
    .sort({ fromDate: -1 })
    .lean();

  if (!course) return null;

  return {
    ...formatCourse(course as ICourseItem),
    formerNames: formerNamesByCourse.get(getCourseKey(course)) ?? [],
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
      const { formerNamesByCourse } = await getFormerNameIndex();

      return {
        ...formatCourse(exactMatch as ICourseItem),
        formerNames: formerNamesByCourse.get(getCourseKey(exactMatch)) ?? [],
      };
    }
  }

  // Fall back to any course with the courseId
  const course = await CourseModel.findOne({ courseId })
    .sort({ fromDate: -1 })
    .lean();

  if (!course) return null;

  const { formerNamesByCourse } = await getFormerNameIndex();

  return {
    ...formatCourse(course as ICourseItem),
    formerNames: formerNamesByCourse.get(getCourseKey(course)) ?? [],
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
    // Drop large fields the Course type never exposes
    {
      $project: {
        formatsOffered: 0,
        courseObjectives: 0,
        studentLearningOutcomes: 0,
        credit: 0,
        creditRestriction: 0,
        repeatability: 0,
        subjectName: 0,
        updatedDate: 0,
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

  const { formerNamesByCourse } = await getFormerNameIndex();

  return courses.map((c) => ({
    ...formatCourse(c),
    gradeDistribution: null,
    formerNames: formerNamesByCourse.get(getCourseKey(c)) ?? [],
  })) as (Exclude<IntermediateCourse, "gradeDistribution"> & {
    gradeDistribution: CourseModule.Course["gradeDistribution"];
  })[];
};
