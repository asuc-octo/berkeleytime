import Fuse from "fuse.js";
import { GraphQLResolveInfo } from "graphql";

import {
  ClassModel,
  ClassType,
  CourseModel,
  CourseType,
  GradeDistributionModel,
  GradeDistributionType,
  SectionModel,
  SectionType,
  TermModel,
} from "@repo/common";

import { getFields } from "../../utils/graphql";
import { formatClass, formatSection } from "../class/formatter";
import { ClassModule } from "../class/generated-types/module-types";
import { formatCourse } from "../course/formatter";
import {
  getAverageGrade,
  getDistribution,
} from "../grade-distribution/controller";
import { GradeDistributionModule } from "../grade-distribution/generated-types/module-types";

const getId = (identifiers?: CourseType["identifiers"]) => {
  return identifiers?.find((identifier) => identifier.type === "cs-course-id")
    ?.id;
};

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

interface Subject {
  abbreviations: string[];
  name: string;
}

// TODO: https://guide.berkeley.edu/courses

export const subjects: Record<string, Subject> = {
  astron: {
    abbreviations: ["astro"],
    name: "Astronomy",
  },
  compsci: {
    abbreviations: ["cs", "comp sci", "computer science"],
    name: "Computer Science",
  },
  mcellbi: {
    abbreviations: ["mcb"],
    name: "Molecular and Cell Biology",
  },
  nusctx: {
    abbreviations: ["nutrisci"],
    name: "Nutritional Sciences and Toxicology",
  },
  bioeng: {
    abbreviations: ["bioe", "bio e", "bio p", "bio eng"],
    name: "Bioengineering",
  },
  biology: {
    abbreviations: ["bio"],
    name: "Biology",
  },
  civeng: {
    abbreviations: ["cive", "civ e", "civ eng"],
    name: "Civil and Environmental Engineering",
  },
  chmeng: {
    abbreviations: ["cheme", "chm eng"],
    name: "Chemical Engineering",
  },
  classic: {
    abbreviations: ["classics"],
    name: "Classics",
  },
  cogsci: {
    abbreviations: ["cogsci"],
    name: "Cognitive Science",
  },
  colwrit: {
    abbreviations: ["college writing", "col writ"],
    name: "College Writing",
  },
  comlit: {
    abbreviations: ["complit", "com lit"],
    name: "Comparative Literature",
  },
  cyplan: {
    abbreviations: ["cy plan", "cp"],
    name: "City and Regional Planning",
  },
  desinv: {
    abbreviations: ["des inv", "design"],
    name: "Design Innovation",
  },
  deveng: {
    abbreviations: ["dev eng"],
    name: "Development Engineering",
  },
  devstd: {
    abbreviations: ["dev std"],
    name: "Development Studies",
  },
  datasci: {
    abbreviations: ["ds", "data", "data sci"],
    name: "Data Science",
  },
  data: {
    abbreviations: ["ds", "data", "data sci"],
    name: "Data Science, Undergraduate",
  },
  ealang: {
    abbreviations: ["ea lang"],
    name: "East Asian Languages and Cultures",
  },
  envdes: {
    abbreviations: ["ed", "env des"],
    name: "Environmental Design",
  },
  eleng: {
    abbreviations: ["ee", "electrical engineering", "el eng"],
    name: "Electrical Engineering",
  },
  eecs: {
    abbreviations: ["eecs"],
    name: "Electrical Engineering and Computer Sciences",
  },
  eneres: {
    abbreviations: ["erg", "er", "ene,res"],
    name: "Energy and Resources Group",
  },
  engin: {
    abbreviations: ["e", "engineering"],
    name: "Engineering",
  },
  envsci: {
    abbreviations: ["env sci"],
    name: "Environmental Sciences",
  },
  ethstd: {
    abbreviations: ["eth std"],
    name: "Ethnic Studies",
  },
  geog: {
    abbreviations: ["geology", "geo"],
    name: "Geography",
  },
  hinurd: {
    abbreviations: ["hin urd", "hin-urd"],
    name: "Hindi-Urdu",
  },
  integbi: {
    abbreviations: ["ib"],
    name: "Integrative Biology",
  },
  indeng: {
    abbreviations: ["ie", "ieor", "ind eng"],
    name: "Industrial Engineering and Operations Research",
  },
  linguis: {
    abbreviations: ["ling"],
    name: "Linguistics",
  },
  "l&s": {
    abbreviations: ["l & s", "ls", "lns"],
    name: "Letters and Science",
  },
  indones: {
    abbreviations: ["indonesian"],
    name: "Indonesian",
  },
  matsci: {
    abbreviations: ["mat sci", "ms", "mse"],
    name: "Materials Science and Engineering",
  },
  meceng: {
    abbreviations: ["mec eng", "meche", "mech e", "me"],
    name: "Mechanical Engineering",
  },
  medst: {
    abbreviations: ["med st"],
    name: "Medical Studies",
  },
  mestu: {
    abbreviations: ["me stu", "middle eastern studies"],
    name: "Middle Eastern Studies",
  },
  milaff: {
    abbreviations: ["mil aff"],
    name: "Military Affairs",
  },
  milsci: {
    abbreviations: ["mil sci"],
    name: "Military Science",
  },
  natamst: {
    abbreviations: ["native american studies", "nat am st"],
    name: "Native American Studies",
  },
  neurosc: {
    abbreviations: ["neurosci"],
    name: "Neuroscience",
  },
  nuceng: {
    abbreviations: ["ne", "nuc eng"],
    name: "Nuclear Engineering",
  },
  mediast: {
    abbreviations: ["media", "media st"],
    name: "Media Studies",
  },
  music: {
    abbreviations: ["mus"],
    name: "Music",
  },
  pbhlth: {
    abbreviations: ["pb hlth", "ph", "pub hlth", "public health"],
    name: "Public Health",
  },
  physed: {
    abbreviations: ["pe", "phys ed"],
    name: "Physical Education",
  },
  polecon: {
    abbreviations: ["poliecon"],
    name: "Political Economy",
  },
  philo: {
    abbreviations: ["philosophy", "philos", "phil"],
    name: "Philosophy",
  },
  plantbi: {
    abbreviations: ["pmb"],
    name: "Plant and Microbial Biology",
  },
  polsci: {
    abbreviations: ["poli", "pol sci", "polisci", "poli sci", "ps"],
    name: "Political Science",
  },
  pubpol: {
    abbreviations: ["pub pol", "pp", "public policy"],
    name: "Public Policy",
  },
  pubaff: {
    abbreviations: ["pubaff", "public affaris"],
    name: "Public Affairs",
  },
  psych: {
    abbreviations: ["psychology"],
    name: "Psychology",
  },
  rhetor: {
    abbreviations: ["rhetoric"],
    name: "Rhetoric",
  },
  sasian: {
    abbreviations: ["s asian"],
    name: "South Asian Studies",
  },
  seasian: {
    abbreviations: ["se asian"],
    name: "Southeast Asian Studies",
  },
  stat: {
    abbreviations: ["stats"],
    name: "Statistics",
  },
  theater: {
    abbreviations: ["tdps"],
    name: "Theater, Dance, and Performance Studies",
  },
  ugba: {
    abbreviations: ["haas"],
    name: "Undergraduate Business Administration",
  },
  vietnms: {
    abbreviations: ["vietnamese"],
    name: "Vietnamese",
  },
  vissci: {
    abbreviations: ["vis sci"],
    name: "Vision Science",
  },
  visstd: {
    abbreviations: ["vis std"],
    name: "Visual Studies",
  },
};

// TODO: Pagination, filtering
export const getCatalog = async (
  year: number,
  semester: string,
  info: GraphQLResolveInfo,
  query?: string | null
) => {
  const name = `${year} ${semester}`;

  const term = await TermModel.findOne({
    name,
  }).lean();

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
    "session.term.name": name,
    anyPrintInScheduleOfClasses: true,
  }).lean();

  // Filtering by identifiers reduces the amount of data returned for courses and sections
  const courseIds = Array.from(
    classes.reduce((accumulator, _class) => {
      const courseId = getId(_class.course?.identifiers);
      if (!courseId) return accumulator;

      accumulator.add(courseId);
      return accumulator;
    }, new Set<string>())
  );

  // Fetch available courses for the term
  const courses = await CourseModel.find({
    identifiers: {
      // The bottleneck seems to be the amount of data we are fetching and not the query itself
      $elemMatch: {
        type: "cs-course-id",
        id: { $in: Array.from(courseIds) },
      },
    },
    printInCatalog: true,
  }).lean();

  // Fetch available sections for the term
  const sections = await SectionModel.find({
    "class.session.term.name": name,
    "class.course.identifiers": {
      // The bottleneck seems to be the amount of data we are fetching and not the query itself
      $elemMatch: {
        type: "cs-course-id",
        id: { $in: Array.from(courseIds) },
      },
    },
    printInScheduleOfClasses: true,
  }).lean();

  const parsedGradeDistributions = {} as Record<
    string,
    GradeDistributionModule.GradeDistribution
  >;

  const children = getFields(info.fieldNodes);
  const includesGradeDistribution = children.includes("gradeDistribution");

  if (includesGradeDistribution) {
    const sectionIds = sections.map((section) => section.id);

    const gradeDistributions = await GradeDistributionModel.find({
      // The bottleneck seems to be the amount of data we are fetching and not the query itself
      classNumber: { $in: sectionIds },
    }).lean();

    const reducedGradeDistributions = gradeDistributions.reduce(
      (accumulator, gradeDistribution) => {
        const courseId = `${gradeDistribution.subject} ${gradeDistribution.courseNumber}`;
        const sectionId = gradeDistribution.classNumber;

        accumulator[courseId] = accumulator[courseId]
          ? [...accumulator[courseId], gradeDistribution]
          : [gradeDistribution];
        accumulator[sectionId] = accumulator[sectionId]
          ? [...accumulator[sectionId], gradeDistribution]
          : [gradeDistribution];

        return accumulator;
      },
      {} as Record<string, GradeDistributionType[]>
    );

    const entries = Object.entries(reducedGradeDistributions);

    for (const [key, value] of entries) {
      const distribution = getDistribution(value);

      parsedGradeDistributions[key] = {
        average: getAverageGrade(distribution),
        distribution,
      } as GradeDistributionModule.GradeDistribution;
    }
  }

  // Turn courses into a map to decrease time complexity for filtering
  const reducedCourses = courses.reduce(
    (accumulator, course) => {
      const id = getId(course?.identifiers);
      if (!id) return accumulator;

      accumulator[id] = course as CourseType;
      return accumulator;
    },
    {} as Record<string, CourseType>
  );

  // Turn sections into a map to decrease time complexity for filtering
  const reducedSections = sections.reduce(
    (accumulator, section) => {
      const courseId = getId(section.class?.course?.identifiers);
      const number = section.class?.number;

      const id = `${courseId}-${number}`;
      if (!id) return accumulator;

      accumulator[id] = (
        accumulator[id] ? [...accumulator[id], section] : [section]
      ) as SectionType[];

      return accumulator;
    },
    {} as Record<string, SectionType[]>
  );

  const reducedClasses = classes.reduce((accumulator, _class) => {
    const courseId = getId(_class.course?.identifiers);
    if (!courseId) return accumulator;

    const course = reducedCourses[courseId];
    if (!course) return accumulator;

    const sections = reducedSections[`${courseId}-${_class.number}`];
    if (!sections) return accumulator;

    const index = sections.findIndex((section) => section.association?.primary);
    if (index === -1) return accumulator;

    const formattedPrimarySection = formatSection(sections.splice(index, 1)[0]);
    const formattedSections = sections.map(formatSection);

    const formattedCourse = formatCourse(
      course
    ) as unknown as ClassModule.Course;

    // Add grade distribution to course
    if (includesGradeDistribution) {
      const key = `${course.subjectArea?.code} ${course.catalogNumber?.formatted}`;
      const gradeDistribution = parsedGradeDistributions[key];

      // Fall back to an empty grade distribution to prevent resolving the field again
      formattedCourse.gradeDistribution = gradeDistribution ?? {
        average: null,
        distribution: [],
      };
    }

    const formattedClass = {
      ...formatClass(_class as ClassType),
      primarySection: formattedPrimarySection,
      sections: formattedSections,
      course: formattedCourse,
    } as unknown as ClassModule.Class;

    // Add grade distribution to class
    if (includesGradeDistribution) {
      const sectionId = formattedPrimarySection.ccn;

      // Fall back to an empty grade distribution to prevent resolving the field again
      const gradeDistribution = parsedGradeDistributions[sectionId] ?? {
        average: null,
        distribution: [],
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
