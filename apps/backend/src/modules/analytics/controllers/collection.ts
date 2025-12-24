import { CollectionModel, UserModel } from "@repo/common";

import { RequestContext } from "../../../types/request-context";
import { requireStaffAuth } from "../helpers/staff-auth";

// Migration cutoff date - data before this is considered migration data
// Migration happened on Dec 3, 2025
const MIGRATION_CUTOFF = new Date("2025-12-04T00:00:00Z");

/**
 * Staff-only endpoint to get collection analytics data
 * Returns:
 * - Collection creation timestamps (for tracking users with schedules over time)
 * - Classes added with addedAt timestamps (for tracking saved classes over time)
 *
 * Filters out migration data - collections/classes that were created during
 * migration and haven't been touched since.
 */
export const getCollectionAnalyticsData = async (context: RequestContext) => {
  await requireStaffAuth(context);

  // Fetch all collections with creation timestamps and classes
  const collections = await CollectionModel.find({})
    .select("createdBy isSystem classes createdAt name")
    .lean();

  // First pass: collect all post-migration class additions and custom collection creations
  const usersWithPostMigrationActivity = new Set<string>();
  const classAdditions: { addedAt: string; userId: string }[] = [];
  const customCollectionCreations: { createdAt: string; userId: string }[] = [];
  const customCollectionDetails: {
    userId: string;
    classCount: number;
    name: string;
    createdAt: string;
  }[] = [];

  // Track first custom collection per user (for unique users metric)
  const userFirstCustomCollection = new Map<string, Date>();

  collections.forEach((col) => {
    const userId = col.createdBy;
    const createdAt = (col as any).createdAt as Date;

    // Track custom (non-system) collections created after migration
    if (!col.isSystem && createdAt >= MIGRATION_CUTOFF) {
      customCollectionCreations.push({
        createdAt: createdAt.toISOString(),
        userId,
      });

      // Track collection details for table
      customCollectionDetails.push({
        userId,
        classCount: col.classes?.length || 0,
        name: (col as any).name || "",
        createdAt: createdAt.toISOString(),
      });

      // Track first custom collection per user
      const existing = userFirstCustomCollection.get(userId);
      if (!existing || createdAt < existing) {
        userFirstCustomCollection.set(userId, createdAt);
      }
    }

    const classes = col.classes || [];
    classes.forEach((classEntry: any) => {
      if (classEntry.addedAt) {
        const addedAt = new Date(classEntry.addedAt);
        // Only include post-migration class additions
        if (addedAt >= MIGRATION_CUTOFF) {
          classAdditions.push({
            addedAt: addedAt.toISOString(),
            userId,
          });
          usersWithPostMigrationActivity.add(userId);
        }
      }
    });
  });

  // Convert user first custom collection to array
  const usersWithCustomCollections = Array.from(
    userFirstCustomCollection.entries()
  ).map(([userId, createdAt]) => ({
    createdAt: createdAt.toISOString(),
    userId,
  }));

  // Second pass: get first activity date for users who have post-migration activity
  // Use their earliest post-migration class addition as their "start" date
  const userFirstActivity = new Map<string, Date>();
  classAdditions.forEach((addition) => {
    const addedAt = new Date(addition.addedAt);
    const existing = userFirstActivity.get(addition.userId);
    if (!existing || addedAt < existing) {
      userFirstActivity.set(addition.userId, addedAt);
    }
  });

  // Only include users who have actually added classes after migration
  const collectionCreations = Array.from(userFirstActivity.entries()).map(
    ([userId, firstAddedAt]) => ({
      createdAt: firstAddedAt.toISOString(),
      userId,
    })
  );

  // Sort by timestamp
  collectionCreations.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  classAdditions.sort(
    (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
  );
  customCollectionCreations.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  usersWithCustomCollections.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Compute highlights
  let largestCollectionSize = 0;
  let largestCustomCollectionSize = 0;
  let largestCustomCollectionName: string | null = null;
  const courseBookmarkCounts = new Map<string, number>();
  const userCollectionCounts = new Map<string, number>();

  collections.forEach((col) => {
    const classCount = col.classes?.length || 0;

    // Track largest collection overall
    if (classCount > largestCollectionSize) {
      largestCollectionSize = classCount;
    }

    // Track largest custom collection
    if (!col.isSystem && classCount > largestCustomCollectionSize) {
      largestCustomCollectionSize = classCount;
      largestCustomCollectionName = (col as any).name || null;
    }

    // Count collections per user (custom only)
    if (!col.isSystem) {
      userCollectionCounts.set(
        col.createdBy,
        (userCollectionCounts.get(col.createdBy) || 0) + 1
      );
    }

    // Count bookmarks per course
    (col.classes || []).forEach((classEntry: any) => {
      if (classEntry.subject && classEntry.courseNumber) {
        const courseKey = `${classEntry.subject} ${classEntry.courseNumber}`;
        courseBookmarkCounts.set(
          courseKey,
          (courseBookmarkCounts.get(courseKey) || 0) + 1
        );
      }
    });
  });

  // Find most bookmarked course
  let mostBookmarkedCourse: string | null = null;
  let mostBookmarkedCourseCount = 0;
  courseBookmarkCounts.forEach((count, course) => {
    if (count > mostBookmarkedCourseCount) {
      mostBookmarkedCourseCount = count;
      mostBookmarkedCourse = course;
    }
  });

  // Find user with most collections
  let mostCollectionsByUser = 0;
  userCollectionCounts.forEach((count) => {
    if (count > mostCollectionsByUser) {
      mostCollectionsByUser = count;
    }
  });

  const highlights = {
    largestCollectionSize,
    largestCustomCollectionSize,
    largestCustomCollectionName,
    mostBookmarkedCourse,
    mostBookmarkedCourseCount,
    mostCollectionsByUser,
  };

  // Look up user emails for custom collections table
  const collectionUserIds = [
    ...new Set(customCollectionDetails.map((c) => c.userId)),
  ];
  const collectionUsers = await UserModel.find({
    _id: { $in: collectionUserIds },
  })
    .select("_id email")
    .lean();
  const collectionUserEmailMap = new Map(
    collectionUsers.map((u) => [u._id.toString(), u.email as string])
  );

  // Sort by class count descending and map to include email
  const customCollections = customCollectionDetails
    .map((c) => ({
      userEmail: collectionUserEmailMap.get(c.userId) || "unknown",
      classCount: c.classCount,
      name: c.name,
      createdAt: c.createdAt,
    }))
    .sort((a, b) => b.classCount - a.classCount);

  return {
    collectionCreations,
    classAdditions,
    customCollectionCreations,
    usersWithCustomCollections,
    customCollections,
    highlights,
  };
};
