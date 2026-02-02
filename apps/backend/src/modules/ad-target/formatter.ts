import { AdTargetType } from "@repo/common/models";

export const formatAdTarget = (
  adTarget: AdTargetType | Record<string, unknown>
) => {
  return {
    id: (adTarget as any)._id?.toString() ?? (adTarget as any).id,
    subjects: (adTarget as any).subjects || [],
    minCourseNumber: (adTarget as any).minCourseNumber || null,
    maxCourseNumber: (adTarget as any).maxCourseNumber || null,
    specificClassIds: (adTarget as any).specificClassIds || [],
    createdAt: (adTarget as any).createdAt?.toISOString?.() ?? null,
  } as const;
};
