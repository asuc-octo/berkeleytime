import { GraphQLResolveInfo } from "graphql";
import { isNil } from "lodash";
import { performance } from "perf_hooks";

import {
  ClassModel,
  CourseModel,
  CourseType,
  GradeModel,
  GradeType,
  SectionModel,
} from "@repo/common";

import { Course, TermInput } from "../../generated-types/graphql";
import { getCourseKey, getCsCourseId } from "../../utils/course";
import { getChildren } from "../../utils/graphql";
import { getTermStartMonth, termToString } from "../../utils/term";
import { getAverage } from "../grade/controller";
import { formatClass, formatCourse, formatSection } from "./formatter";

function matchCsCourseId(id: any) {
  return {
    $elemMatch: {
      type: "cs-course-id",
      id,
    },
  };
}

export async function getCatalog(
  term: TermInput,
  info: GraphQLResolveInfo
): Promise<Course[] | null> {
  const start = performance.now();

  const classes = await ClassModel.find({
    "session.term.name": termToString(term),
    // "aggregateEnrollmentStatus.maxEnroll": { $gt: 0 },
    anyPrintInScheduleOfClasses: true,
  }).lean();

  const clTime = performance.now();
  console.log("Classes query time: ", clTime - start);

  if (classes.length === 0) {
    return null;
  }

  const csCourseIds = new Set(
    classes.map((c) => getCsCourseId(c.course as CourseType))
  );

  const courses = await CourseModel.find({
    identifiers: matchCsCourseId({ $in: Array.from(csCourseIds) }),
    /*
                    The SIS toDate is unreliable so we can only
                    filter by fromDate and then sort to find the
                    most recent course.
                */
    // fromDate: { $lte: getTermStartMonth(term) },
  })
    .sort({
      "classSubjectArea.code": 1,
      "catalogNumber.formatted": 1,
      fromDate: -1,
    })
    .lean();

  const coTime = performance.now();
  console.log("Courses query time: ", coTime - clTime);

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

  const grTime = performance.now();
  console.log("Grades query time: ", grTime - coTime);

  const sections = await SectionModel.find({
    "class.course.identifiers": matchCsCourseId({
      $in: Array.from(csCourseIds),
    }),
    "class.session.term.name": termToString(term),
    "association.primary": true,
  }).lean();

  const seTime = performance.now();
  console.log("Sections query time: ", seTime - grTime);

  const catalog: any = {};

  for (const c of courses) {
    const key = getCourseKey(c);
    const id = getCsCourseId(c);

    // skip duplicates
    if (id in catalog) continue;

    catalog[id] = {
      ...formatCourse(c, term),
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

  const end = performance.now();
  console.log("Total time: ", end - start);

  return Object.values(catalog);
}

export function getClass(
  subject: string,
  courseNumber: string,
  term: TermInput,
  classNumber: string
) {
  return ClassModel.findOne({
    "course.subjectArea.code": subject,
    "course.catalogNumber.formatted": courseNumber,
    "session.term.name": termToString(term),
    number: classNumber,
  })
    .lean()
    .then(formatClass);
}

export function getClassById(id: string, term: TermInput, classNumber: string) {
  return ClassModel.findOne({
    "course.identifiers": matchCsCourseId(id),
    "session.term.name": termToString(term),
    number: classNumber,
  })
    .lean()
    .then(formatClass);
}

export function getPrimarySection(
  id: string,
  term: TermInput,
  classNumber: string
) {
  return SectionModel.findOne({
    "class.course.identifiers": matchCsCourseId(id),
    "class.session.term.name": termToString(term),
    "class.number": classNumber,
    "association.primary": true,
  })
    .lean()
    .then(formatSection);
}

export function getClassSections(
  id: string,
  term: TermInput,
  classNumber: string
) {
  // for associated sections with a lecture. Lecture assumed to be of form 00x
  return SectionModel.find({
    "class.course.identifiers": matchCsCourseId(id),
    "class.session.term.name": termToString(term),
    $or: [
      {
        "class.number": {
          $regex: new RegExp("^" + classNumber[classNumber.length - 1]),
        },
      },
      { "class.number": "999" },
    ],
  })
    .lean()
    .then((s) => s.map(formatSection));
}

async function getCourseFromFilter(
  filter: any,
  term?: TermInput | null,
  info?: GraphQLResolveInfo | null
) {
  const course = await CourseModel.findOne(filter)
    .sort({ fromDate: -1 })
    .lean()
    .then((c) => formatCourse(c, term));

  if (info && getChildren(info).includes("gradeAverage")) {
    const grades: GradeType[] = [];
    const gradesQuery = await GradeModel.find(
      {
        CourseSubjectShortNm:
          course.raw.classSubjectArea?.description ??
          course.raw.subjectArea?.description,
        CourseNumber: course.raw.catalogNumber?.formatted,
      },
      { GradeNm: 1, EnrollmentCnt: 1 }
    );
    for (const grade of gradesQuery) {
      grades.push(grade);
    }
    course.gradeAverage = await getAverage(grades);
  }

  return course;
}

export function getCourse(
  subject: string,
  courseNumber: string,
  term?: TermInput | null,
  info?: GraphQLResolveInfo
) {
  const filter: any = {
    "classSubjectArea.code": subject,
    "catalogNumber.formatted": courseNumber,
  };

  if (!isNil(term)) {
    filter.fromDate = { $lte: getTermStartMonth(term) };
  }

  return getCourseFromFilter(filter, term, info);
}

export function getCourseById(id: string, term?: TermInput | null) {
  const filter: any = {
    identifiers: matchCsCourseId(id),
  };

  if (!isNil(term)) {
    filter.fromDate = { $lte: getTermStartMonth(term) };
  }

  return getCourseFromFilter(filter, term);
}

export function getCourseClasses(id: string, term?: TermInput | null) {
  const filter: any = {
    "course.identifiers": matchCsCourseId(id),
  };

  if (!isNil(term)) {
    filter["session.term.name"] = termToString(term);
  }

  return ClassModel.find(filter)
    .lean()
    .then((c) => c.map(formatClass));
}

export function getCourseSections(id: string, term?: TermInput | null) {
  const filter: any = {
    "class.course.identifiers": matchCsCourseId(id),
  };

  if (!isNil(term)) {
    filter["class.session.term.name"] = termToString(term);
  }
  return SectionModel.find(filter)
    .lean()
    .then((s) => s.map(formatSection));
}

export function getRequiredCourses(csCourseIds: string[]) {
  return csCourseIds.map((csCourseId) =>
    CourseModel.findOne({
      identifiers: matchCsCourseId(csCourseId),
      /*
                  The SIS toDate is unreliable so we can only
                  filter by fromDate and then sort to find the
                  most recent course.
              */
      // fromDate: { $lte: getTermStartMonth(term) },
    })
      .lean()
      .then(formatCourse)
  );
}

export function getCrossListing(
  displayNames: string[],
  term?: TermInput | null
) {
  return displayNames.map((name) => {
    const filter: any = {
      displayName: name,
    };

    if (!isNil(term)) {
      filter.fromDate = { $lte: getTermStartMonth(term) };
    }

    return CourseModel.findOne(filter)
      .sort({ fromDate: -1 })
      .lean()
      .then((c) => formatCourse(c, term));
  });
}

export function getSection(
  subject: string,
  courseNumber: string,
  term: TermInput,
  classNumber: string,
  sectionNumber: string
) {
  return SectionModel.findOne({
    "class.course.subjectArea.code": subject,
    "class.course.catalogNumber.formatted": courseNumber,
    "class.session.term.name": termToString(term),
    "class.number": classNumber,
    number: sectionNumber,
  })
    .lean()
    .then(formatSection);
}

export function getSectionById(
  id: string,
  term: TermInput,
  classNumber: string,
  sectionNumber: string
) {
  return SectionModel.findOne({
    "class.course.identifiers": matchCsCourseId(id),
    "class.session.term.name": termToString(term),
    "class.number": classNumber,
    number: sectionNumber,
  })
    .lean()
    .then(formatSection);
}

export async function getCourseList(
  info: GraphQLResolveInfo
): Promise<Course[] | null> {
  const start = performance.now();

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

  const clTime = performance.now();
  console.log("Courses query time: ", clTime - start);

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

  const grTime = performance.now();
  console.log("Grades query time: ", grTime - clTime);

  return courses.map((c) => ({
    ...formatCourse(c),
    gradeAverage: getAverage(gradesMap[getCourseKey(c)]),
  }));
}