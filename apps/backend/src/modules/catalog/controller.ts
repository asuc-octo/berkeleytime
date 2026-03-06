import type { GraphQLResolveInfo } from "graphql";
import type { PipelineStage } from "mongoose";

import {
  getAverageGrade,
  getDistribution,
  getPnpPercentage,
  getPnpPercentageFromCounts,
  parseTermName,
  parseTimeToMinutes,
} from "@repo/common";
import {
  CatalogClassModel,
  ClassModel,
  ClassViewCountModel,
  CourseModel,
  GradeDistributionModel,
  type IClassItem,
  type ICourseItem,
  type IGradeDistributionItem,
  type ISectionItem,
  NewEnrollmentHistoryModel,
  SectionModel,
  TermModel,
} from "@repo/common/models";

import { getFields, hasFieldPath } from "../../utils/graphql";
import { formatClass, formatSection } from "../class/formatter";
import type { ClassModule } from "../class/generated-types/module-types";
import { formatCourse } from "../course/formatter";
import { formatEnrollment } from "../enrollment/formatter";
import type { EnrollmentModule } from "../enrollment/generated-types/module-types";
import type { GradeDistributionModule } from "../grade-distribution/generated-types/module-types";

export interface CatalogQueryParams {
  year: number;
  semester: string;
  search?: string | null;
  filters?: {
    levels?: string[] | null;
    departments?: string[] | null;
    unitsMin?: number | null;
    unitsMax?: number | null;
    days?: number[] | null;
    timeFrom?: string | null;
    timeTo?: string | null;
    enrollmentFilter?: string | null;
    gradingFilters?: string[] | null;
    breadths?: string[] | null;
    universityRequirements?: string[] | null;
    online?: boolean | null;
  } | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  page?: number | null;
  pageSize?: number | null;
}

type CatalogFilterCondition = Record<string, unknown>;
type CatalogFilterQuery = Record<string, unknown> & {
  $and?: CatalogFilterCondition[];
};

const appendAndCondition = (
  query: CatalogFilterQuery,
  condition: CatalogFilterCondition
) => {
  if (!query.$and) {
    query.$and = [];
  }

  query.$and.push(condition);
};

export const getCatalogClassIdentities = async (
  year: number,
  semester: string
) => {
  return CatalogClassModel.find(
    { year, semester },
    { subject: 1, courseNumber: 1, number: 1, sessionId: 1, _id: 0 }
  ).lean();
};

export const getCatalogSearch = async (params: CatalogQueryParams) => {
  const {
    year,
    semester,
    search,
    filters,
    sortBy,
    sortOrder,
    page = 1,
    pageSize = 25,
  } = params;

  const effectivePage = Math.max(1, page ?? 1);
  const effectivePageSize = Math.min(100, Math.max(1, pageSize ?? 25));
  const skip = (effectivePage - 1) * effectivePageSize;

  // If search is provided, use Atlas Search aggregation
  if (search && search.trim().length > 0) {
    return getCatalogWithSearch({
      year,
      semester,
      searchTerm: search.trim(),
      filters,
      limit: effectivePageSize,
      skip,
    });
  }

  // Build filter query
  const query = buildFilterQuery(year, semester, filters);

  // Build sort
  const sort = buildSort(sortBy, sortOrder);

  // Execute count and find in parallel
  const [totalCount, results] = await Promise.all([
    CatalogClassModel.countDocuments(query),
    CatalogClassModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(effectivePageSize)
      .lean(),
  ]);

  return { results, totalCount };
};

const getCatalogWithSearch = async ({
  year,
  semester,
  searchTerm,
  filters,
  limit,
  skip,
}: {
  year: number;
  semester: string;
  searchTerm: string;
  filters: CatalogQueryParams["filters"];
  limit: number;
  skip: number;
}) => {
  const filterMatch = buildFilterQuery(year, semester, filters);

  // Use Atlas Search $search stage
  const pipeline: PipelineStage[] = [
    {
      $search: {
        index: "catalog_search",
        compound: {
          should: [
            {
              autocomplete: {
                query: searchTerm,
                path: "searchableNames",
                fuzzy: { maxEdits: 1 },
                score: { boost: { value: 10 } },
              },
            },
            {
              text: {
                query: searchTerm,
                path: "searchableNames",
                fuzzy: { maxEdits: 1 },
                score: { boost: { value: 5 } },
              },
            },
            {
              text: {
                query: searchTerm,
                path: "courseTitle",
                fuzzy: { maxEdits: 1 },
                score: { boost: { value: 2 } },
              },
            },
            {
              text: {
                query: searchTerm,
                path: "courseDescription",
                fuzzy: { maxEdits: 1 },
                score: { boost: { value: 0.5 } },
              },
            },
          ],
          minimumShouldMatch: 1,
        },
      },
    } as PipelineStage,
    { $match: filterMatch } as PipelineStage,
    {
      $addFields: {
        searchScore: { $meta: "searchScore" },
      },
    } as PipelineStage,
  ];

  // NOTE: $facet materializes the full result set in memory before paginating.
  // For broad searches, consider using $searchMeta in a separate query for the count.
  pipeline.push({
    $facet: {
      results: [
        { $sort: { searchScore: -1 } },
        { $skip: skip },
        { $limit: limit },
      ],
      count: [{ $count: "total" }],
    },
  } as PipelineStage);

  const [facetResult] = await CatalogClassModel.aggregate(pipeline);

  const results = facetResult?.results ?? [];
  const totalCount = facetResult?.count?.[0]?.total ?? 0;

  return { results, totalCount };
};

const buildFilterQuery = (
  year: number,
  semester: string,
  filters: CatalogQueryParams["filters"]
): CatalogFilterQuery => {
  const query: CatalogFilterQuery = { year, semester };

  if (!filters) return query;

  // Level filter
  if (filters.levels && filters.levels.length > 0) {
    query.level = { $in: filters.levels };
  }

  // Department filter
  if (filters.departments && filters.departments.length > 0) {
    query.academicOrganization = { $in: filters.departments };
  }

  // Units range overlap
  if (filters.unitsMin != null || filters.unitsMax != null) {
    const min = filters.unitsMin ?? 0;
    const max = filters.unitsMax ?? 99;
    query.unitsMax = { $gte: min };
    query.unitsMin = { $lte: max };
  }

  // Days filter - class meeting days must be a subset of selected days
  if (filters.days && filters.days.length > 0) {
    for (let i = 0; i < 7; i++) {
      if (!filters.days.includes(i)) {
        query[`meetingDays.${i}`] = false;
      }
    }
    const dayConditions = filters.days.map((day) => ({
      [`meetingDays.${day}`]: true,
    }));
    appendAndCondition(query, {
      $or: dayConditions,
    });
  }

  // Time range filter
  if (filters.timeFrom || filters.timeTo) {
    if (filters.timeFrom) {
      const fromMinutes = parseTimeToMinutes(filters.timeFrom);
      if (fromMinutes !== null) {
        const existingStartMinutes =
          (query.meetingStartMinutes as Record<string, unknown> | undefined) ??
          {};
        query.meetingStartMinutes = {
          ...existingStartMinutes,
          $gte: fromMinutes,
          $ne: null,
        };
      }
    }
    if (filters.timeTo) {
      const toMinutes = parseTimeToMinutes(filters.timeTo);
      if (toMinutes !== null) {
        const existingEndMinutes =
          (query.meetingEndMinutes as Record<string, unknown> | undefined) ??
          {};
        query.meetingEndMinutes = {
          ...existingEndMinutes,
          $lte: toMinutes,
        };
      }
    }
    if (!query.meetingStartMinutes) {
      query.meetingStartMinutes = { $ne: null };
    }
  }

  // Enrollment filter
  if (filters.enrollmentFilter) {
    switch (filters.enrollmentFilter) {
      case "OPEN":
        query.enrollmentStatus = "O";
        break;
      case "NON_RESERVED_OPEN":
        query.enrollmentStatus = "O";
        query.$expr = {
          $gt: [
            { $subtract: ["$maxEnroll", "$enrolledCount"] },
            { $ifNull: ["$activeReservedMaxCount", 0] },
          ],
        };
        break;
      case "WAITLIST_OPEN":
        appendAndCondition(query, {
          $or: [
            { enrollmentStatus: "O" },
            {
              $and: [
                { maxWaitlist: { $gt: 0 } },
                { $expr: { $lt: ["$waitlistedCount", "$maxWaitlist"] } },
              ],
            },
          ],
        });
        break;
    }
  }

  // Grading filter
  if (filters.gradingFilters && filters.gradingFilters.length > 0) {
    query.gradingBasis = { $in: filters.gradingFilters };
  }

  // Breadth requirements
  if (filters.breadths && filters.breadths.length > 0) {
    query.breadthRequirements = { $in: filters.breadths };
  }

  // University requirements
  if (
    filters.universityRequirements &&
    filters.universityRequirements.length > 0
  ) {
    query.universityRequirements = { $in: filters.universityRequirements };
  }

  // Online filter
  if (filters.online) {
    query.primaryOnline = true;
  }

  return query;
};

const buildSort = (
  sortBy?: string | null,
  sortOrder?: string | null
): Record<string, 1 | -1> => {
  const order = sortOrder === "ASC" ? 1 : -1;

  switch (sortBy) {
    case "UNITS":
      return { unitsMax: order, subject: 1, courseNumber: 1 };
    case "AVERAGE_GRADE":
      return { allTimeAverageGrade: order, subject: 1, courseNumber: 1 };
    case "OPEN_SEATS":
      return { openSeats: order, subject: 1, courseNumber: 1 };
    case "RELEVANCE":
    default:
      return { viewCount: order, subject: 1, courseNumber: 1 };
  }
};

export const getCatalogFilterOptions = async (
  year: number,
  semester: string
) => {
  const [filterAgg, semesters] = await Promise.all([
    CatalogClassModel.aggregate([
      { $match: { year, semester } },
      {
        $unwind: {
          path: "$breadthRequirements",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$universityRequirements",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: null,
          departments: {
            $addToSet: {
              code: "$academicOrganization",
              name: "$academicOrganizationName",
            },
          },
          levels: { $addToSet: "$level" },
          gradingOptions: { $addToSet: "$gradingBasis" },
          breadthRequirements: { $addToSet: "$breadthRequirements" },
          universityRequirements: { $addToSet: "$universityRequirements" },
          minStartMinutes: { $min: "$meetingStartMinutes" },
          maxEndMinutes: { $max: "$meetingEndMinutes" },
        },
      },
    ]),
    TermModel.find({ hasCatalogData: true }).select({ name: 1 }).lean(),
  ]);

  const result = filterAgg[0];

  const breadths = result
    ? (result.breadthRequirements as string[]).filter(Boolean).sort()
    : [];
  const uniReqs = result
    ? (result.universityRequirements as string[]).filter(Boolean).sort()
    : [];

  const semesterList = semesters
    .map((t) => parseTermName(t.name))
    .filter((s): s is { year: number; semester: string } => s !== null)
    .sort((a, b) => b.year - a.year || a.semester.localeCompare(b.semester));

  // Compute time range rounded to nearest hour boundaries
  let timeRange = null;
  if (result?.minStartMinutes != null && result?.maxEndMinutes != null) {
    const flooredStart = Math.floor(result.minStartMinutes / 60) * 60;
    const ceiledEnd = Math.ceil(result.maxEndMinutes / 60) * 60;
    const formatMinutes = (m: number) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    };
    timeRange = {
      minStartTime: formatMinutes(flooredStart),
      maxEndTime: formatMinutes(ceiledEnd),
    };
  }

  return {
    departments: (result?.departments ?? [])
      .filter(
        (d: { code: string; name: string }) => d.code != null && d.name != null
      )
      .sort((a: { name: string }, b: { name: string }) =>
        a.name.localeCompare(b.name)
      ),
    levels: (result?.levels ?? []).filter(Boolean).sort(),
    gradingOptions: (result?.gradingOptions ?? []).filter(Boolean).sort(),
    breadthRequirements: breadths,
    universityRequirements: uniReqs,
    semesters: semesterList,
    timeRange,
  };
};

const EMPTY_GRADE_DISTRIBUTIONS: readonly IGradeDistributionItem[] =
  [] as const;

/**
 * Legacy catalog resolver — returns the relational [Class!]! shape
 * expected by ag-frontend's GET_CATALOG query.
 */
export const getCatalogLegacy = async (
  year: number,
  semester: string,
  info: GraphQLResolveInfo
) => {
  const [term, classes] = await Promise.all([
    TermModel.findOne({ name: `${year} ${semester}` })
      .select({ _id: 1 })
      .lean(),
    ClassModel.find({
      year,
      semester,
      anyPrintInScheduleOfClasses: true,
    }).lean(),
  ]);

  if (!term) throw new Error("Invalid term");

  const courseIds = classes.map((_class) => _class.courseId);
  const uniqueCourseIds = [...new Set(courseIds)];

  const [courses, sections] = await Promise.all([
    CourseModel.find({
      courseId: { $in: uniqueCourseIds },
      printInCatalog: true,
    }).lean(),
    SectionModel.find({
      year,
      semester,
      courseId: { $in: uniqueCourseIds },
      printInScheduleOfClasses: true,
    }).lean(),
  ]);

  let parsedGradeDistributions = {} as Record<
    string,
    GradeDistributionModule.GradeDistribution
  >;

  const children = getFields(info.fieldNodes);
  const selectionIncludes = (path: string[]) =>
    info.fieldNodes.some((node) =>
      node.selectionSet
        ? hasFieldPath(node.selectionSet.selections, info.fragments, path)
        : false
    );

  const includesClassGradeDistribution = selectionIncludes([
    "gradeDistribution",
  ]);
  const includesCourseGradeDistribution = selectionIncludes([
    "course",
    "gradeDistribution",
  ]);
  const includesCourseGradeDistributionDistribution = selectionIncludes([
    "course",
    "gradeDistribution",
    "distribution",
  ]);
  const includesViewCount = selectionIncludes(["viewCount"]);

  const shouldLoadGradeDistributions =
    includesClassGradeDistribution ||
    includesCourseGradeDistributionDistribution;

  if (shouldLoadGradeDistributions) {
    const sectionIds = sections.map((section) => section.sectionId);

    const [classGradeDistributions, courseGradeDistributions] =
      await Promise.all([
        includesClassGradeDistribution
          ? GradeDistributionModel.find({
              sectionId: { $in: sectionIds },
            }).lean()
          : Promise.resolve(EMPTY_GRADE_DISTRIBUTIONS),
        includesCourseGradeDistributionDistribution
          ? GradeDistributionModel.find({
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
            }).lean()
          : Promise.resolve(EMPTY_GRADE_DISTRIBUTIONS),
      ]);

    const reducedGradeDistributions = {} as Record<
      string,
      GradeDistributionModule.GradeDistribution
    >;

    if (includesClassGradeDistribution) {
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
    }

    if (includesCourseGradeDistributionDistribution) {
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
    }

    parsedGradeDistributions = reducedGradeDistributions;
  }

  let enrollmentMap = {} as Record<string, EnrollmentModule.Enrollment | null>;

  const includesEnrollment = children.includes("enrollment");

  if (includesEnrollment) {
    const sectionIds = sections.map((section) => section.sectionId);

    const enrollments = await NewEnrollmentHistoryModel.find({
      termId: term._id,
      sectionId: { $in: sectionIds },
    }).lean();

    enrollmentMap = enrollments.reduce(
      (acc, enrollment) => {
        acc[enrollment.sectionId] = formatEnrollment(enrollment);
        return acc;
      },
      {} as Record<string, EnrollmentModule.Enrollment | null>
    );
  }

  let classViewCountsMap = {} as Record<string, number>;

  if (includesViewCount) {
    const classViewCounts = await ClassViewCountModel.find({
      year,
      semester,
    }).lean();

    classViewCountsMap = classViewCounts.reduce(
      (accumulator, viewCountRecord) => {
        const key = `${viewCountRecord.sessionId}:${viewCountRecord.subject}:${viewCountRecord.courseNumber}:${viewCountRecord.number}`;
        accumulator[key] = viewCountRecord.viewCount ?? 0;
        return accumulator;
      },
      {} as Record<string, number>
    );
  }

  const reducedCourses = courses.reduce(
    (accumulator, course) => {
      accumulator[course.courseId] = course as ICourseItem;
      return accumulator;
    },
    {} as Record<string, ICourseItem>
  );

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

    const classSections = reducedSections[`${courseId}-${_class.number}`];
    if (!classSections) return accumulator;

    const index = classSections.findIndex((section) => section.primary);
    if (index === -1) return accumulator;

    const primarySection = classSections.splice(index, 1)[0];
    const formattedPrimarySection = formatSection(
      primarySection,
      includesEnrollment ? enrollmentMap[primarySection.sectionId] : undefined
    );
    const formattedSections = classSections.map((section) =>
      formatSection(
        section,
        includesEnrollment ? enrollmentMap[section.sectionId] : undefined
      )
    );

    const formattedCourse = formatCourse(
      course
    ) as unknown as ClassModule.Course;

    if (includesCourseGradeDistribution) {
      const courseFallback = {
        average: course.allTimeAverageGrade ?? null,
        distribution: [],
        pnpPercentage: getPnpPercentageFromCounts(
          course.allTimePassCount,
          course.allTimeNoPassCount
        ),
      };

      if (includesCourseGradeDistributionDistribution) {
        const key = `${_class.subject}-${_class.courseNumber}`;
        const gradeDistribution =
          parsedGradeDistributions[key] ?? courseFallback;

        formattedCourse.gradeDistribution = gradeDistribution;
      } else {
        formattedCourse.gradeDistribution = courseFallback;
      }
    }

    const formattedClass = {
      ...formatClass(_class as IClassItem),
      primarySection: formattedPrimarySection,
      sections: formattedSections,
      course: formattedCourse,
    } as unknown as ClassModule.Class;

    if (includesViewCount) {
      const viewCountKey = `${_class.sessionId}:${_class.subject}:${_class.courseNumber}:${_class.number}`;
      formattedClass.viewCount = classViewCountsMap[viewCountKey] ?? 0;
    }

    if (includesClassGradeDistribution) {
      const sectionId = formattedPrimarySection.sectionId;
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
