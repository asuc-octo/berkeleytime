import { AdTargetType } from "@repo/common/models";

export const formatAdTarget = (
  adTarget: AdTargetType | Record<string, unknown>
) => {
  return {
    id: adTarget._id?.toString() ?? "",
    subjects: adTarget.subjects || [],
    minCourseNumber: adTarget.minCourseNumber || null,
    maxCourseNumber: adTarget.maxCourseNumber || null,
    createdAt:
      adTarget.createdAt instanceof Date
        ? adTarget.createdAt.toISOString()
        : null,
  } as const;
};
