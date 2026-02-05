import { GraphQLError } from "graphql";
import type { RedisClientType } from "redis";

import {
  AdTargetModel,
  ClassModel,
  CourseModel,
  StaffMemberModel,
} from "@repo/common/models";

import { invalidateAdTargetsCache } from "../class/controller";
import { formatAdTarget } from "./formatter";
import { Semester } from "../../generated-types/graphql";

// Context interface for authenticated requests
export interface AdTargetRequestContext {
  user: {
    _id: string;
    isAuthenticated: boolean;
  };
  redis: RedisClientType;
}

// Helper to verify the current user is a staff member
export const requireStaffMember = async (context: AdTargetRequestContext) => {
  if (!context.user?._id) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const staffMember = await StaffMemberModel.findOne({
    userId: context.user._id,
  }).lean();

  if (!staffMember) {
    throw new GraphQLError("Only staff members can perform this action", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  return staffMember;
};

export interface CreateAdTargetInput {
  subjects?: string[];
  minCourseNumber?: string | null;
  maxCourseNumber?: string | null;
}

export interface UpdateAdTargetInput {
  subjects?: string[] | null;
  minCourseNumber?: string | null;
  maxCourseNumber?: string | null;
}

const normalizeSubjects = (subjects?: string[] | null) => {
  if (!subjects) return [];

  const normalized = subjects
    .flatMap((subject) => subject.split(","))
    .map((subject) => subject.trim().replace(/\s+/g, " ").toUpperCase())
    .filter((subject) => subject.length > 0);

  return [...new Set(normalized)];
};

const normalizeSubjectCode = (subject: string) => {
  return subject.trim().replace(/\s+/g, " ").toUpperCase();
};

const normalizeText = (value?: string | null) => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeCourseNumberInput = (value?: string | null) => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const isValidCourseNumberRangeValue = (value?: string | null) => {
  if (value == null) return true;
  const trimmed = value.trim();
  if (trimmed.length === 0) return true;
  return /^\d+$/.test(trimmed);
};

const extractCourseNumbers = (courseNumber: string): number[] => {
  const matches = courseNumber.match(/\d+/g);
  return matches ? matches.map(Number) : [];
};

const anyNumberInRange = (
  numbers: number[],
  min: number | null,
  max: number | null
) => {
  if (numbers.length === 0) return false;
  return numbers.some((n) => {
    if (min !== null && n < min) return false;
    if (max !== null && n > max) return false;
    return true;
  });
};

const hasAtLeastOneCriterion = (data: {
  subjects?: string[] | null;
  minCourseNumber?: string | null;
  maxCourseNumber?: string | null;
}) =>
  (data.subjects?.length ?? 0) > 0 ||
  data.minCourseNumber != null ||
  data.maxCourseNumber != null;

// ensure a user is properly authorized even to get ad requests
export const getAllAdTargets = async (context: AdTargetRequestContext) => {
  await requireStaffMember(context);
  const adTargets = await AdTargetModel.find().sort({ createdAt: -1 });
  return adTargets.map(formatAdTarget);
};

export const createAdTarget = async (
  context: AdTargetRequestContext,
  input: CreateAdTargetInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const normalizedSubjects = normalizeSubjects(input.subjects);
  const normalizedMinCourseNumber = normalizeCourseNumberInput(
    input.minCourseNumber
  );
  const normalizedMaxCourseNumber = normalizeCourseNumberInput(
    input.maxCourseNumber
  );
  if (
    !isValidCourseNumberRangeValue(normalizedMinCourseNumber) ||
    !isValidCourseNumberRangeValue(normalizedMaxCourseNumber)
  ) {
    throw new GraphQLError("Course number range must be numeric", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  const doc = {
    subjects: normalizedSubjects,
    minCourseNumber: normalizedMinCourseNumber ?? undefined,
    maxCourseNumber: normalizedMaxCourseNumber ?? undefined,
  };
  if (!hasAtLeastOneCriterion(doc)) {
    throw new GraphQLError("At least one targeting criterion is required", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const adTarget = await AdTargetModel.create(doc);

  await invalidateAdTargetsCache(context.redis);
  return formatAdTarget(adTarget);
};

export const updateAdTarget = async (
  context: AdTargetRequestContext,
  adTargetId: string,
  input: UpdateAdTargetInput
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const updateData: Record<string, unknown> = {};
  // undefined = not sent (no change); null = clear/set empty
  if (input.subjects !== undefined) {
    updateData.subjects = normalizeSubjects(input.subjects);
  }
  if (input.minCourseNumber !== undefined) {
    const normalizedMinCourseNumber = normalizeCourseNumberInput(
      input.minCourseNumber
    );
    if (!isValidCourseNumberRangeValue(normalizedMinCourseNumber)) {
      throw new GraphQLError("Course number range must be numeric", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    updateData.minCourseNumber = normalizedMinCourseNumber;
  }
  if (input.maxCourseNumber !== undefined) {
    const normalizedMaxCourseNumber = normalizeCourseNumberInput(
      input.maxCourseNumber
    );
    if (!isValidCourseNumberRangeValue(normalizedMaxCourseNumber)) {
      throw new GraphQLError("Course number range must be numeric", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    updateData.maxCourseNumber = normalizedMaxCourseNumber;
  }

  const existing = await AdTargetModel.findById(adTargetId).lean();
  if (!existing) {
    throw new GraphQLError("AdTarget not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }
  const merged = { ...existing, ...updateData };
  if (!hasAtLeastOneCriterion(merged)) {
    throw new GraphQLError("At least one targeting criterion is required", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const adTarget = await AdTargetModel.findByIdAndUpdate(
    adTargetId,
    updateData,
    {
      new: true,
    }
  );

  if (!adTarget) {
    throw new GraphQLError("AdTarget not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  await invalidateAdTargetsCache(context.redis);
  return formatAdTarget(adTarget);
};

export const deleteAdTarget = async (
  context: AdTargetRequestContext,
  adTargetId: string
) => {
  // Verify caller is a staff member
  await requireStaffMember(context);

  const result = await AdTargetModel.findByIdAndDelete(adTargetId);
  if (result !== null) {
    await invalidateAdTargetsCache(context.redis);
  }
  return result !== null;
};

export interface AdTargetPreviewInput {
  year: number;
  semester: Semester;
  subjects?: string[] | null;
  minCourseNumber?: string | null;
  maxCourseNumber?: string | null;
}

export interface AdTargetPreviewClass {
  courseId: string;
  subject: string;
  courseNumber: string;
  number: string;
  title?: string | null;
  year: number;
  semester: Semester;
  sessionId: string;
}

export const getAdTargetPreview = async (
  context: AdTargetRequestContext,
  input: AdTargetPreviewInput
): Promise<AdTargetPreviewClass[]> => {
  await requireStaffMember(context);

  const normalizedSubjects = normalizeSubjects(input.subjects);
  const normalizedMinCourseNumber = normalizeCourseNumberInput(
    input.minCourseNumber
  );
  const normalizedMaxCourseNumber = normalizeCourseNumberInput(
    input.maxCourseNumber
  );
  if (
    !isValidCourseNumberRangeValue(normalizedMinCourseNumber) ||
    !isValidCourseNumberRangeValue(normalizedMaxCourseNumber)
  ) {
    throw new GraphQLError("Course number range must be numeric", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  const hasSubjects = normalizedSubjects.length > 0;
  const min = normalizedMinCourseNumber
    ? parseInt(normalizedMinCourseNumber, 10)
    : null;
  const max = normalizedMaxCourseNumber
    ? parseInt(normalizedMaxCourseNumber, 10)
    : null;
  const hasRange = min !== null || max !== null;

  if (!hasSubjects && !hasRange) {
    throw new GraphQLError("At least one targeting criterion is required", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const courseVariants = await ClassModel.aggregate<{
    _id: string;
    variants: { subject: string; courseNumber: string }[];
  }>([
    { $match: { year: input.year, semester: input.semester } },
    {
      $group: {
        _id: {
          courseId: "$courseId",
          subject: "$subject",
          courseNumber: "$courseNumber",
        },
      },
    },
    {
      $group: {
        _id: "$_id.courseId",
        variants: {
          $push: { subject: "$_id.subject", courseNumber: "$_id.courseNumber" },
        },
      },
    },
  ]);

  const matchingCourseIds = new Set<string>();
  for (const course of courseVariants) {
    const matchesVariant = course.variants.some((variant) => {
      const subject = normalizeSubjectCode(variant.subject);
      if (hasSubjects && !normalizedSubjects.includes(subject)) {
        return false;
      }

      if (!hasRange) {
        return true;
      }

      return anyNumberInRange(
        extractCourseNumbers(variant.courseNumber),
        min,
        max
      );
    });

    if (matchesVariant) {
      matchingCourseIds.add(course._id);
    }
  }

  if (matchingCourseIds.size === 0) {
    return [];
  }

  const classes = await ClassModel.find({
    year: input.year,
    semester: input.semester,
    courseId: { $in: [...matchingCourseIds] },
  })
    .select({
      courseId: 1,
      subject: 1,
      courseNumber: 1,
      number: 1,
      title: 1,
      year: 1,
      semester: 1,
      sessionId: 1,
    })
    .sort({ subject: 1, courseNumber: 1, number: 1 })
    .lean();

  const courseIds = [...new Set(classes.map((entry) => entry.courseId))];
  const courses = await CourseModel.find({
    courseId: { $in: courseIds },
  })
    .select({ courseId: 1, title: 1 })
    .lean();

  const courseTitleMap = new Map(
    courses.map((course) => [course.courseId, normalizeText(course.title)])
  );

  return classes.map((entry) => ({
    courseId: entry.courseId,
    subject: entry.subject,
    courseNumber: entry.courseNumber,
    number: entry.number,
    title:
      normalizeText(entry.title) ?? courseTitleMap.get(entry.courseId) ?? null,
    year: entry.year,
    semester: entry.semester as Semester,
    sessionId: entry.sessionId,
  }));
};
