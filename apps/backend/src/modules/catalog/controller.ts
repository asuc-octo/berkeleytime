import { GraphQLResolveInfo } from "graphql";

import {
  ClassModel,
  CourseModel,
  CourseType,
  GradeModel,
  GradeType,
  SectionModel,
} from "@repo/common";

import { getCourseKey, getCsCourseId } from "../../utils/course";
import { getChildren } from "../../utils/graphql";
import { formatClass, formatSection } from "../class/formatter";
import { formatCourse } from "../course/formatter";
import { getAverage } from "../grade/controller";
import { CatalogModule } from "./generated-types/module-types";

function matchCsCourseId(id: any) {
  return {
    $elemMatch: {
      type: "cs-course-id",
      id,
    },
  };
}

export const getCatalog = async (
  year: number,
  semester: string,
  info: GraphQLResolveInfo
) => {
  const classes = await ClassModel.find({
    "session.term.name": `${year} ${semester}`,
    anyPrintInScheduleOfClasses: true,
  }).lean();

  if (classes.length === 0) return [];

  const csCourseIds = new Set(
    classes.map((c) => getCsCourseId(c.course as CourseType))
  );

  const courses = await CourseModel.find({
    identifiers: matchCsCourseId({ $in: Array.from(csCourseIds) }),
  })
    .sort({
      "classSubjectArea.code": 1,
      "catalogNumber.formatted": 1,
      fromDate: -1,
    })
    .lean();

  /* Map grades to course keys for easy lookup */
  const gradesMap: { [key: string]: GradeType[] } = {};
  courses.forEach((c) => (gradesMap[getCourseKey(c)] = []));

  const children = getChildren(info);

  if (children.includes("gradeAverage")) {
    const grades = await GradeModel.find(
      // No filters because an appropriately large filter is actually significantly slower than no filter.
      {},
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

  const sections = await SectionModel.find({
    "class.course.identifiers": matchCsCourseId({
      $in: Array.from(csCourseIds),
    }),
    "class.session.term.name": `${year} ${semester}`,
    "association.primary": true,
  }).lean();

  const catalog: any = {};

  for (const c of courses) {
    const key = getCourseKey(c);
    const id = getCsCourseId(c);

    // skip duplicates
    if (id in catalog) continue;

    catalog[id] = {
      ...formatCourse(c),
      classes: [],
      gradeAverage: getAverage(gradesMap[key]),
    };
  }

  for (const c of classes) {
    const id = getCsCourseId(c.course as CourseType);

    if (!(id in catalog)) {
      // throw new Error(`Class ${c.course?.subjectArea?.code} ${c.course?.catalogNumber?.formatted}`
      //     + ` has a course id ${id} that doesn't exist for the ${term.semester} ${term.year} term.`)

      // TODO(production): log
      continue;
    }

    catalog[id].classes.push(formatClass(c));
  }

  for (const s of sections) {
    if (!s.class) continue;

    const id = getCsCourseId(s.class.course as CourseType);

    if (!(id in catalog)) {
      // throw new Error(`Section ${s.class.course?.subjectArea?.code} ${s.class.course?.catalogNumber?.formatted}`
      //     + ` has a course id ${id} that doesn't exist for the ${term.semester} ${term.year} term.`)

      // TODO(production): log
      continue;
    }

    const index = catalog[id].classes.findIndex(
      (c: any) => c.number === s.class?.number
    );

    if (index === -1) continue;

    const primarySection = formatSection(s);

    if (!primarySection.ccn) continue;

    catalog[id].classes[index].primarySection = primarySection;
  }

  for (const id in catalog) {
    catalog[id].classes = catalog[id].classes.filter(
      (c: any) => c.primarySection?.ccn
    );

    if (catalog[id].classes.length === 0) {
      delete catalog[id];
    }
  }

  return Object.values(catalog) as CatalogModule.Course[];
};
