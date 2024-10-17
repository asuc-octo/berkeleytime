import { GraphQLResolveInfo } from "graphql";

import { ClassModel, CourseModel, GradeModel, GradeType } from "@repo/common";

import { getCourseKey } from "../../utils/course";
import { getChildren } from "../../utils/graphql";
import { formatClass } from "../class/formatter";
import { getAverage } from "../grade/controller";
import { IntermediateCourse, formatCourse } from "./formatter";

export const getCourse = async (
  subject: string,
  courseNumber: string,
  info?: GraphQLResolveInfo | null
) => {
  const course = await CourseModel.findOne({
    "subjectArea.code": subject,
    "catalogNumber.formatted": courseNumber,
  })
    .sort({ fromDate: -1 })
    .lean();

  if (!course) return null;

  const formattedCourse = formatCourse(course);

  if (info && getChildren(info).includes("gradeAverage")) {
    const grades: GradeType[] = [];

    const gradesQuery = await GradeModel.find(
      {
        CourseSubjectShortNm: course?.subjectArea?.description,
        CourseNumber: course?.catalogNumber?.formatted,
      },
      { GradeNm: 1, EnrollmentCnt: 1 }
    );

    for (const grade of gradesQuery) {
      grades.push(grade);
    }

    formattedCourse.gradeAverage = getAverage(grades);
  }

  return formattedCourse;
};

export const getClassesByCourse = async (
  subjectArea: string,
  courseNumber: string
) => {
  const classes = await ClassModel.find({
    "subjectArea.code": subjectArea,
    "catalogNumber.formatted": courseNumber,
  }).lean();

  return classes.map(formatClass);
};

export const getAssociatedCourses = async (courses: string[]) => {
  const queries = courses.map((course) => {
    const split = course.split(" ");

    const subject = split.slice(0, -1).join(" ");
    const number = split[split.length - 1];

    return {
      "subjectArea.code": subject,
      "catalogNumber.formatted": number,
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
              associatedCourse.subjectArea?.code === course.subjectArea?.code &&
              course.catalogNumber?.formatted ===
                associatedCourse.catalogNumber?.formatted
          ) === index
      )
      .map(formatCourse)
  );
};

export const getCourses = async (info: GraphQLResolveInfo) => {
  const courses = await CourseModel.aggregate([
    {
      $match: {
        printInCatalog: true,
        "status.code": "ACTIVE",
        "catalogNumber.prefix": "",
      },
    },
    {
      $sort: {
        "classSubjectArea.code": 1,
        "catalogNumber.formatted": 1,
        fromDate: -1,
      },
    },
    {
      $group: {
        _id: "$displayName",
        document: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: { newRoot: "$document" },
    },
  ]);

  /* Map grades to course keys for easy lookup */
  const gradesMap: { [key: string]: GradeType[] } = {};
  courses.forEach((c) => (gradesMap[getCourseKey(c)] = []));

  const children = getChildren(info);

  if (children.includes("gradeAverage")) {
    const grades = await GradeModel.find(
      {
        /*
                    No filters because an appropriately large filter
                    is actually significantly slower than no filter.
                */
      },
      {
        CourseSubjectShortNm: 1,
        CourseNumber: 1,
        GradeNm: 1,
        EnrollmentCnt: 1,
      }
    ).lean();

    for (const g of grades) {
      const key = `${g.CourseSubjectShortNm as string} ${
        g.CourseNumber as string
      }`;
      if (key in gradesMap) {
        gradesMap[key].push(g);
      }
    }
  }

  return courses.map((c) => ({
    ...formatCourse(c),
    gradeAverage: getAverage(gradesMap[getCourseKey(c)]),
  })) as IntermediateCourse[];
};
