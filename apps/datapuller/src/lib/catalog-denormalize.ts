import { connection } from "mongoose";

import { SUBJECT_NICKNAME_MAP } from "@repo/common/lib/departmentNicknames";
import {
  AggregatedMetricsModel,
  CatalogClassModel,
  ClassModel,
  ClassViewCountModel,
  CourseModel,
  ICatalogClassItem,
  ISectionItem,
  NewEnrollmentHistoryModel,
  SectionModel,
  TermModel,
} from "@repo/common/models";

import { Config } from "../shared/config";

type AggregatedMetric = {
  metricName: string;
  count: number;
  weightedAverage: number;
};

const aggregateRatingsForCourses = async (
  courseIds: string[]
): Promise<Map<string, AggregatedMetric[]>> => {
  const results = await AggregatedMetricsModel.aggregate([
    { $match: { courseId: { $in: courseIds }, categoryCount: { $gt: 0 } } },
    {
      $group: {
        _id: {
          courseId: "$courseId",
          metricName: "$metricName",
          categoryValue: "$categoryValue",
        },
        categoryCount: { $sum: "$categoryCount" },
      },
    },
    {
      $group: {
        _id: { courseId: "$_id.courseId", metricName: "$_id.metricName" },
        totalCount: { $sum: "$categoryCount" },
        sumValues: {
          $sum: { $multiply: ["$_id.categoryValue", "$categoryCount"] },
        },
      },
    },
    {
      $group: {
        _id: "$_id.courseId",
        metrics: {
          $push: {
            metricName: "$_id.metricName",
            count: "$totalCount",
            weightedAverage: {
              $cond: [
                { $eq: ["$totalCount", 0] },
                0,
                { $divide: ["$sumValues", "$totalCount"] },
              ],
            },
          },
        },
      },
    },
  ]);
  return new Map(results.map((r: any) => [r._id, r.metrics]));
};

const normalizeSubject = (subject: string) =>
  subject.replace(/[,\s]/g, "").toUpperCase();

const parseTimeToMinutes = (time: string): number | null => {
  const parts = time.split(":").map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return parts[0] * 60 + parts[1];
};

const getLevel = (
  academicCareer: string | undefined,
  courseNumber: string
): string => {
  if (academicCareer === "UGRD") {
    return courseNumber.match(/(\d)\d\d/) ? "Upper Division" : "Lower Division";
  }
  if (academicCareer === "GRAD") return "Graduate";
  if (academicCareer === "UCBX") return "Extension";
  return "Lower Division";
};

const buildSearchableNames = (
  subject: string,
  courseNumber: string,
  departmentNicknames: string | undefined
): string[] => {
  const normalizedSubject = normalizeSubject(subject);
  const containsPrefix = /^[a-zA-Z].*/.test(courseNumber);
  const alternateNumber = courseNumber.slice(1);

  // Collect all abbreviations from SIS nicknames and hardcoded map
  const sisNicknames = departmentNicknames
    ? departmentNicknames
        .split("!")
        .map((abbr: string) => abbr.trim())
        .filter(Boolean)
    : [];

  const hardcodedNicknames = SUBJECT_NICKNAME_MAP[normalizedSubject] || [];
  const abbreviations = [...new Set([...sisNicknames, ...hardcodedNicknames])];

  const names = new Set<string>();

  // Add canonical name
  names.add(`${normalizedSubject} ${courseNumber}`);
  names.add(`${normalizedSubject}${courseNumber}`);

  if (containsPrefix) {
    names.add(`${normalizedSubject} ${alternateNumber}`);
    names.add(`${normalizedSubject}${alternateNumber}`);
  }

  // Add nickname variations
  for (const abbreviation of abbreviations) {
    const abbr = abbreviation.toUpperCase();
    names.add(`${abbr} ${courseNumber}`);
    names.add(`${abbr}${courseNumber}`);

    if (containsPrefix) {
      names.add(`${abbr} ${alternateNumber}`);
      names.add(`${abbr}${alternateNumber}`);
    }
  }

  return Array.from(names);
};

const filterInstructors = (
  instructors:
    | {
        printInScheduleOfClasses?: boolean;
        familyName?: string;
        givenName?: string;
        role?: string;
      }[]
    | undefined
) => {
  if (!instructors) return [];

  const pis = instructors.filter(
    (i) =>
      i.role === "PI" &&
      typeof i.familyName === "string" &&
      typeof i.givenName === "string"
  );

  const list =
    pis.length > 0
      ? pis
      : instructors.filter(
          (i) =>
            typeof i.familyName === "string" && typeof i.givenName === "string"
        );

  return list
    .map((i) => ({
      familyName: i.familyName!,
      givenName: i.givenName!,
    }))
    .sort((a, b) => a.familyName.localeCompare(b.familyName));
};

type SeatReservationCountLike = {
  number?: number;
  maxEnroll?: number;
};

type SeatReservationTypeLike = {
  number?: number;
  fromDate?: string;
};

const computeActiveReservedMaxCount = (
  seatReservationCount: SeatReservationCountLike[] | undefined,
  seatReservationTypes: SeatReservationTypeLike[] | undefined
): number => {
  const counts = seatReservationCount ?? [];
  if (counts.length === 0) return 0;

  const types = seatReservationTypes ?? [];
  const now = new Date();

  return counts.reduce((sum, reservation) => {
    const maxEnroll = reservation.maxEnroll ?? 0;
    const matchingType = types.find((type) => type.number === reservation.number);
    const fromDate = matchingType?.fromDate ?? "";
    const fromDateObj = fromDate ? new Date(fromDate) : null;
    const hasValidFromDate =
      fromDateObj !== null && !Number.isNaN(fromDateObj.getTime());

    // Keep this in sync with backend enrollment formatter logic:
    // reservation is active when maxEnroll > 1 and the fromDate window has started.
    const isActive =
      maxEnroll > 1 && (!hasValidFromDate || (fromDateObj && fromDateObj <= now));

    return sum + (isActive ? maxEnroll : 0);
  }, 0);
};

/**
 * Builds denormalized catalog class documents for a given term.
 * Joins classes + courses + sections + enrollment into single documents.
 */
export const buildCatalogClasses = async (
  year: number,
  semester: string
): Promise<ICatalogClassItem[]> => {
  const term = await TermModel.findOne({ name: `${year} ${semester}` })
    .select({ _id: 1, id: 1 })
    .lean();

  if (!term) return [];

  // Fetch all needed data in parallel
  const classes = await ClassModel.find({
    year,
    semester,
    anyPrintInScheduleOfClasses: true,
  }).lean();

  if (classes.length === 0) return [];

  const courseIds = [...new Set(classes.map((c) => c.courseId))];

  const [courses, sections] = await Promise.all([
    CourseModel.find({
      courseId: { $in: courseIds },
      printInCatalog: true,
    }).lean(),
    SectionModel.find({
      year,
      semester,
      courseId: { $in: courseIds },
      printInScheduleOfClasses: true,
    }).lean(),
  ]);

  // Fetch enrollment, view counts, and ratings in parallel
  const sectionIds = sections.map((s) => s.sectionId);
  const [enrollments, viewCounts, ratingsMap] = await Promise.all([
    NewEnrollmentHistoryModel.find({
      termId: term.id,
      sectionId: { $in: sectionIds },
    }).lean(),
    ClassViewCountModel.find({ year, semester }).lean(),
    aggregateRatingsForCourses(courseIds),
  ]);

  // Build lookup maps
  const courseMap = new Map(courses.map((c) => [c.courseId, c]));

  const sectionMap = new Map<string, ISectionItem[]>();
  for (const section of sections) {
    const key = `${section.courseId}-${section.classNumber}`;
    const existing = sectionMap.get(key);
    if (existing) {
      existing.push(section);
    } else {
      sectionMap.set(key, [section]);
    }
  }

  const enrollmentMap = new Map<string, (typeof enrollments)[number]>();
  for (const enrollment of enrollments) {
    enrollmentMap.set(enrollment.sectionId, enrollment);
  }

  const viewCountMap = new Map<string, number>();
  for (const vc of viewCounts) {
    const key = `${vc.sessionId}:${vc.subject}:${vc.courseNumber}:${vc.number}`;
    viewCountMap.set(key, vc.viewCount ?? 0);
  }

  // Build denormalized documents
  const catalogClasses: ICatalogClassItem[] = [];

  for (const _class of classes) {
    const course = courseMap.get(_class.courseId);
    if (!course) continue;

    const classSections =
      sectionMap.get(`${_class.courseId}-${_class.number}`) ?? [];
    const primaryIdx = classSections.findIndex((s) => s.primary);
    if (primaryIdx === -1) continue;

    const primarySection = classSections[primaryIdx];
    const secondarySections = classSections.filter((_, i) => i !== primaryIdx);

    // Extract enrollment for primary section
    const primaryEnrollment = enrollmentMap.get(primarySection.sectionId);
    const latestEnrollment =
      primaryEnrollment?.history?.[primaryEnrollment.history.length - 1];
    const activeReservedMaxCount = computeActiveReservedMaxCount(
      latestEnrollment?.seatReservationCount,
      primaryEnrollment?.seatReservationTypes
    );

    // Compute pre-computed fields
    const normalizedSubject = normalizeSubject(_class.subject);
    const level = getLevel(course.academicCareer, _class.courseNumber);

    // Compute meeting time fields from primary section
    const primaryMeetings = primarySection.meetings ?? [];
    const meetingDays = [false, false, false, false, false, false, false];
    let meetingStartMinutes: number | null = null;
    let meetingEndMinutes: number | null = null;

    for (const meeting of primaryMeetings) {
      if (meeting.days) {
        meeting.days.forEach((day, idx) => {
          if (day && idx < 7) meetingDays[idx] = true;
        });
      }
      if (meeting.startTime) {
        const mins = parseTimeToMinutes(meeting.startTime);
        if (
          mins !== null &&
          (meetingStartMinutes === null || mins < meetingStartMinutes)
        ) {
          meetingStartMinutes = mins;
        }
      }
      if (meeting.endTime) {
        const mins = parseTimeToMinutes(meeting.endTime);
        if (
          mins !== null &&
          (meetingEndMinutes === null || mins > meetingEndMinutes)
        ) {
          meetingEndMinutes = mins;
        }
      }
    }

    // Extract breadth requirements from section attributes
    const breadthRequirements: string[] = [];
    const sectionAttributes = primarySection.sectionAttributes ?? [];
    for (const attr of sectionAttributes) {
      if (attr.attribute?.code === "GE" && attr.value?.description) {
        breadthRequirements.push(attr.value.description);
      }
    }

    // Extract university requirements from requirement designation
    const universityRequirements: string[] = [];
    if (_class.requirementDesignation?.description) {
      universityRequirements.push(_class.requirementDesignation.description);
    }

    // Build searchable names
    const searchableNames = buildSearchableNames(
      _class.subject,
      _class.courseNumber,
      course.departmentNicknames
    );

    // View count
    const viewCountKey = `${_class.sessionId}:${normalizedSubject}:${_class.courseNumber}:${_class.number}`;

    // Build secondary sections with enrollment
    const formattedSections = secondarySections.map((section) => {
      const enrollment = enrollmentMap.get(section.sectionId);
      const latest = enrollment?.history?.[enrollment.history.length - 1];
      return {
        sectionId: section.sectionId,
        number: section.number,
        component: section.component,
        online: section.instructionMode === "O",
        meetings: section.meetings?.map((m) => ({
          ...m,
          instructors: filterInstructors(m.instructors),
        })),
        enrollmentStatus: latest?.status,
        enrolledCount: latest?.enrolledCount,
        maxEnroll: latest?.maxEnroll,
        waitlistedCount: latest?.waitlistedCount,
        maxWaitlist: latest?.maxWaitlist,
      };
    });

    catalogClasses.push({
      // Identity
      year: _class.year,
      semester: _class.semester,
      termId: _class.termId,
      sessionId: _class.sessionId,
      subject: normalizedSubject,
      courseNumber: _class.courseNumber,
      number: _class.number,
      courseId: _class.courseId,

      // Class fields
      title: _class.title,
      description: _class.description,
      gradingBasis: _class.gradingBasis,
      finalExam: _class.finalExam,
      unitsMin: _class.allowedUnits?.minimum ?? 0,
      unitsMax: _class.allowedUnits?.maximum ?? 0,
      instructionMode: _class.instructionMode,
      anyPrintInScheduleOfClasses: _class.anyPrintInScheduleOfClasses,
      requirementDesignation: _class.requirementDesignation,

      // Course fields (flattened)
      courseTitle: course.title,
      courseDescription: course.description,
      departmentNicknames: course.departmentNicknames,
      academicCareer: course.academicCareer,
      academicOrganization: course.academicOrganization,
      academicOrganizationName: course.academicOrganizationName,
      allTimeAverageGrade: course.allTimeAverageGrade ?? null,
      allTimePassCount: course.allTimePassCount ?? null,
      allTimeNoPassCount: course.allTimeNoPassCount ?? null,

      // Primary section fields
      primarySectionId: primarySection.sectionId,
      primaryComponent: primarySection.component,
      primaryOnline: primarySection.instructionMode === "O",
      sectionAttributes: primarySection.sectionAttributes,
      meetings: primaryMeetings.map((m) => ({
        ...m,
        instructors: filterInstructors(m.instructors),
      })),
      exams: primarySection.exams,

      // Pre-computed filter fields
      level,
      meetingDays,
      meetingStartMinutes,
      meetingEndMinutes,
      breadthRequirements,
      universityRequirements,

      // Search fields
      searchableNames,

      // Enrollment (latest snapshot)
      enrollmentStatus: latestEnrollment?.status,
      enrolledCount: latestEnrollment?.enrolledCount,
      maxEnroll: latestEnrollment?.maxEnroll,
      waitlistedCount: latestEnrollment?.waitlistedCount,
      maxWaitlist: latestEnrollment?.maxWaitlist,
      activeReservedMaxCount,

      // Secondary sections
      sections: formattedSections,

      // Ratings/grades
      viewCount: viewCountMap.get(viewCountKey) ?? 0,
      aggregatedRatings: ratingsMap.has(_class.courseId)
        ? { metrics: ratingsMap.get(_class.courseId)! }
        : null,
    });
  }

  return catalogClasses;
};

/**
 * Refreshes the catalog_classes collection for a given term.
 * Uses a transaction to atomically replace all docs for the term.
 */
export const refreshCatalogClasses = async (
  log: Config["log"],
  year: number,
  semester: string
) => {
  log.info(`Building denormalized catalog for ${year} ${semester}...`);

  const catalogClasses = await buildCatalogClasses(year, semester);

  if (catalogClasses.length === 0) {
    log.warn(`No catalog classes built for ${year} ${semester}, skipping.`);
    return;
  }

  const session = await connection.startSession();
  try {
    await session.withTransaction(async () => {
      const { deletedCount } = await CatalogClassModel.deleteMany(
        { year, semester },
        { session }
      );

      log.trace(
        `Deleted ${deletedCount} existing catalog classes for ${year} ${semester}`
      );

      // Insert in batches to avoid transaction size limits
      const BATCH_SIZE = 2000;
      let insertedCount = 0;
      for (let i = 0; i < catalogClasses.length; i += BATCH_SIZE) {
        const batch = catalogClasses.slice(i, i + BATCH_SIZE);
        const result = await CatalogClassModel.insertMany(batch, {
          ordered: false,
          session,
        });
        insertedCount += result.length;
      }

      log.info(
        `Inserted ${insertedCount} catalog classes for ${year} ${semester}`
      );
    });
  } finally {
    await session.endSession();
  }
};

/**
 * Refreshes the catalog_classes collection for all terms with catalog data.
 * Used for manual rebuilds and migrations.
 */
export const refreshAllCatalogClasses = async (log: Config["log"]) => {
  const termNames = await TermModel.distinct("name", {
    hasCatalogData: true,
  });

  log.info(
    `Rebuilding catalog for ${termNames.length} terms with catalog data...`
  );

  for (const name of termNames) {
    const parts = name.split(" ");
    if (parts.length !== 2) continue;

    const year = parseInt(parts[0], 10);
    const semester = parts[1];
    if (isNaN(year)) continue;

    await refreshCatalogClasses(log, year, semester);
  }

  log.info("Catalog rebuild complete.");
};

/**
 * Updates only the aggregated ratings on catalog_classes for a given term.
 * Runs the same bulk aggregation pipeline as buildCatalogClasses but scoped
 * to courseIds present in the catalog for this term.
 */
export const updateCatalogRatings = async (
  log: Config["log"],
  year: number,
  semester: string
) => {
  const courseIds = await CatalogClassModel.distinct("courseId", {
    year,
    semester,
  });

  if (courseIds.length === 0) return;

  const ratingsMap = await aggregateRatingsForCourses(courseIds);

  const bulkOps: Parameters<typeof CatalogClassModel.bulkWrite>[0] = [];

  for (const [courseId, metrics] of ratingsMap) {
    bulkOps.push({
      updateMany: {
        filter: { year, semester, courseId },
        update: { $set: { aggregatedRatings: { metrics } } },
      },
    });
  }

  // Null out ratings for courses that no longer have any
  const courseIdsWithoutRatings = courseIds.filter(
    (id) => !ratingsMap.has(id)
  );

  if (courseIdsWithoutRatings.length > 0) {
    bulkOps.push({
      updateMany: {
        filter: { year, semester, courseId: { $in: courseIdsWithoutRatings } },
        update: { $set: { aggregatedRatings: null } },
      },
    });
  }

  if (bulkOps.length > 0) {
    const result = await CatalogClassModel.bulkWrite(bulkOps, {
      ordered: false,
    });
    log.info(
      `Updated ratings for ${ratingsMap.size} courses on catalog_classes (${result.modifiedCount} docs modified)`
    );
  }
};

/**
 * Updates denormalized all-time grade summary fields on catalog_classes.
 * Uses courseId joins so we can refresh grades without rebuilding the catalog.
 */
export const updateCatalogGradeSummaries = async (log: Config["log"]) => {
  const courseIds = (await CatalogClassModel.distinct("courseId")) as string[];
  if (courseIds.length === 0) return;

  const courses = await CourseModel.find({
    courseId: { $in: courseIds },
  })
    .select({
      courseId: 1,
      allTimeAverageGrade: 1,
      allTimePassCount: 1,
      allTimeNoPassCount: 1,
    })
    .lean();

  const seenCourseIds = new Set<string>();
  const bulkOps: Parameters<typeof CatalogClassModel.bulkWrite>[0] = [];

  for (const course of courses) {
    if (!course.courseId) continue;
    seenCourseIds.add(course.courseId);

    bulkOps.push({
      updateMany: {
        filter: { courseId: course.courseId },
        update: {
          $set: {
            allTimeAverageGrade: course.allTimeAverageGrade ?? null,
            allTimePassCount: course.allTimePassCount ?? null,
            allTimeNoPassCount: course.allTimeNoPassCount ?? null,
          },
        },
      },
    });
  }

  const courseIdsWithoutCourseRows = courseIds.filter(
    (courseId) => !seenCourseIds.has(courseId)
  );

  if (courseIdsWithoutCourseRows.length > 0) {
    bulkOps.push({
      updateMany: {
        filter: { courseId: { $in: courseIdsWithoutCourseRows } },
        update: {
          $set: {
            allTimeAverageGrade: null,
            allTimePassCount: null,
            allTimeNoPassCount: null,
          },
        },
      },
    });
  }

  if (bulkOps.length === 0) return;

  const BULK_BATCH_SIZE = 500;
  let modifiedCount = 0;
  for (let i = 0; i < bulkOps.length; i += BULK_BATCH_SIZE) {
    const batch = bulkOps.slice(i, i + BULK_BATCH_SIZE);
    const result = await CatalogClassModel.bulkWrite(batch, {
      ordered: false,
    });
    modifiedCount += result.modifiedCount;
  }

  log.info(
    `Updated grade summaries for ${seenCourseIds.size.toLocaleString()} courses on catalog_classes (${modifiedCount.toLocaleString()} docs modified)`
  );
};

/**
 * Updates only the enrollment fields on catalog_classes for sections that changed.
 * Much cheaper than a full rebuild - used by the enrollment puller.
 */
export const updateCatalogEnrollment = async (
  log: Config["log"],
  year: number,
  semester: string,
  sectionEnrollments: Map<
    string,
    {
      status?: string;
      enrolledCount?: number;
      maxEnroll?: number;
      waitlistedCount?: number;
      maxWaitlist?: number;
      activeReservedMaxCount?: number;
    }
  >
) => {
  if (sectionEnrollments.size === 0) return;

  const bulkOps: any[] = [];

  for (const [sectionId, enrollment] of sectionEnrollments) {
    // Update primary section enrollment
    bulkOps.push({
      updateMany: {
        filter: { year, semester, primarySectionId: sectionId },
        update: {
          $set: {
            enrollmentStatus: enrollment.status,
            enrolledCount: enrollment.enrolledCount,
            maxEnroll: enrollment.maxEnroll,
            waitlistedCount: enrollment.waitlistedCount,
            maxWaitlist: enrollment.maxWaitlist,
            activeReservedMaxCount: enrollment.activeReservedMaxCount,
          },
        },
      },
    });

    // Update secondary sections enrollment
    bulkOps.push({
      updateMany: {
        filter: { year, semester, "sections.sectionId": sectionId },
        update: {
          $set: {
            "sections.$.enrollmentStatus": enrollment.status,
            "sections.$.enrolledCount": enrollment.enrolledCount,
            "sections.$.maxEnroll": enrollment.maxEnroll,
            "sections.$.waitlistedCount": enrollment.waitlistedCount,
            "sections.$.maxWaitlist": enrollment.maxWaitlist,
          },
        },
      },
    });
  }

  if (bulkOps.length > 0) {
    const result = await CatalogClassModel.bulkWrite(bulkOps, {
      ordered: false,
    });
    log.info(
      `Updated enrollment for ${sectionEnrollments.size} sections on catalog_classes (${result.modifiedCount} docs modified)`
    );
  }
};
