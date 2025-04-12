import { ClassModel, CourseModel, IClassItem, ICourseItem } from "@repo/common";

import { formatClass } from "../class/formatter";
import { IntermediateCourse, formatCourse } from "./formatter";
import { CourseModule } from "./generated-types/module-types";

export const getCourse = async (subject: string, number: string) => {
  const course = await CourseModel.findOne({ subject, number })
    .sort({ fromDate: -1 })
    .lean();

  if (!course) return null;

  return formatCourse(course as ICourseItem);
};

export const getClassesByCourse = async (courseId: string) => {
  const classes = await ClassModel.find({
    courseId,
  }).lean();

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

  return courses.map((c) => ({
    ...formatCourse(c),
    gradeDistribution: null,
  })) as (Exclude<IntermediateCourse, "gradeDistribution"> & {
    gradeDistribution: CourseModule.Course["gradeDistribution"];
  })[];
};
