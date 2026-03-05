import { CatalogClassModel, TermModel } from "@repo/common/models";

interface CatalogQueryParams {
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

const parseTimeToMinutes = (time: string): number | null => {
  const parts = time.split(":").map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return parts[0] * 60 + parts[1];
};

const appendAndCondition = (
  query: Record<string, any>,
  condition: Record<string, any>
) => {
  if (!query.$and) {
    query.$and = [];
  }

  query.$and.push(condition);
};

export const getCatalog = async (params: CatalogQueryParams) => {
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
    return getCatalogWithSearch(
      year,
      semester,
      search.trim(),
      filters,
      effectivePageSize,
      skip
    );
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

const getCatalogWithSearch = async (
  year: number,
  semester: string,
  searchTerm: string,
  filters: CatalogQueryParams["filters"],
  limit: number,
  skip: number
) => {
  const filterMatch = buildFilterQuery(year, semester, filters);

  // Use Atlas Search $search stage
  const pipeline: any[] = [
    {
      $search: {
        index: "catalog_search",
        compound: {
          should: [
            {
              autocomplete: {
                query: searchTerm,
                path: "searchableNames",
                score: { boost: { value: 10 } },
              },
            },
            {
              text: {
                query: searchTerm,
                path: "searchableNames",
                score: { boost: { value: 5 } },
              },
            },
            {
              text: {
                query: searchTerm,
                path: "courseTitle",
                score: { boost: { value: 2 } },
              },
            },
            {
              text: {
                query: searchTerm,
                path: "courseDescription",
                score: { boost: { value: 0.5 } },
              },
            },
          ],
          minimumShouldMatch: 1,
        },
      },
    },
    { $match: filterMatch },
    {
      $addFields: {
        searchScore: { $meta: "searchScore" },
      },
    },
  ];

  // Use $facet for count + paginated results in one query
  pipeline.push({
    $facet: {
      results: [
        { $sort: { searchScore: -1 } },
        { $skip: skip },
        { $limit: limit },
      ],
      count: [{ $count: "total" }],
    },
  });

  const [facetResult] = await CatalogClassModel.aggregate(pipeline);

  const results = facetResult?.results ?? [];
  const totalCount = facetResult?.count?.[0]?.total ?? 0;

  return { results, totalCount };
};

const buildFilterQuery = (
  year: number,
  semester: string,
  filters: CatalogQueryParams["filters"]
): Record<string, any> => {
  const query: Record<string, any> = { year, semester };

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
        query.meetingStartMinutes = {
          ...(query.meetingStartMinutes || {}),
          $gte: fromMinutes,
          $ne: null,
        };
      }
    }
    if (filters.timeTo) {
      const toMinutes = parseTimeToMinutes(filters.timeTo);
      if (toMinutes !== null) {
        query.meetingEndMinutes = {
          ...(query.meetingEndMinutes || {}),
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
      return {
        enrollmentStatus: 1,
        enrolledCount: order,
        subject: 1,
        courseNumber: 1,
      };
    case "RELEVANCE":
    default:
      return { viewCount: -1, subject: 1, courseNumber: 1 };
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
          breadthRequirements: {
            $push: "$breadthRequirements",
          },
          universityRequirements: {
            $push: "$universityRequirements",
          },
        },
      },
    ]),
    TermModel.find({ hasCatalogData: true }).select({ name: 1 }).lean(),
  ]);

  const result = filterAgg[0];

  const breadths = result
    ? [...new Set(result.breadthRequirements.flat() as string[])]
        .filter(Boolean)
        .sort()
    : [];
  const uniReqs = result
    ? [...new Set(result.universityRequirements.flat() as string[])]
        .filter(Boolean)
        .sort()
    : [];

  const semesterList = semesters
    .map((t) => {
      const parts = t.name.split(" ");
      if (parts.length !== 2) return null;
      return { year: parseInt(parts[0], 10), semester: parts[1] };
    })
    .filter((s): s is { year: number; semester: string } => s !== null)
    .sort((a, b) => b.year - a.year || a.semester.localeCompare(b.semester));

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
  };
};
