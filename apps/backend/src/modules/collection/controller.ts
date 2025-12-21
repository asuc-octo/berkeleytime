import { GraphQLError } from "graphql";
import { Types } from "mongoose";

import {
  ClassModel,
  CollectionColor,
  CollectionModel,
  StaffMemberModel,
  UserModel,
} from "@repo/common";

import { CollectionModule } from "./generated-types/module-types";

export interface RequestContext {
  user: {
    _id?: string;
    isAuthenticated: boolean;
  };
}

export interface StoredClassEntry {
  year: number;
  semester: string;
  sessionId: string;
  subject: string;
  courseNumber: string;
  classNumber: string;
  addedAt: Date;
}

export interface CollectionDocument {
  _id: Types.ObjectId;
  createdBy: string;
  name: string;
  color?: CollectionColor;
  pinnedAt?: Date;
  lastAdd: Date;
  isSystem: boolean;
  classes: StoredClassEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export const ALL_SAVED_NAME = "All Saved";

export const getOrCreateAllSaved = async (
  context: RequestContext
): Promise<CollectionDocument> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  let allSaved = await CollectionModel.findOne({
    createdBy: context.user._id,
    isSystem: true,
    name: ALL_SAVED_NAME,
  });

  if (!allSaved) {
    // For existing users, populate with union of all classes from their collections
    const existingCollections = await CollectionModel.find({
      createdBy: context.user._id,
    }).lean();

    const allClassesMap = new Map<string, StoredClassEntry>();
    for (const collection of existingCollections) {
      for (const classEntry of collection.classes || []) {
        const key = `${classEntry.year}|${classEntry.semester}|${classEntry.sessionId}|${classEntry.subject}|${classEntry.courseNumber}|${classEntry.classNumber}`;
        if (!allClassesMap.has(key)) {
          allClassesMap.set(key, classEntry as StoredClassEntry);
        }
      }
    }

    allSaved = await CollectionModel.create({
      createdBy: context.user._id,
      name: ALL_SAVED_NAME,
      isSystem: true,
      pinnedAt: new Date(),
      lastAdd: new Date(),
      classes: Array.from(allClassesMap.values()),
    });
  }

  return allSaved.toObject() as unknown as CollectionDocument;
};

export const getAllCollections = async (
  context: RequestContext
): Promise<CollectionDocument[]> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  await getOrCreateAllSaved(context);

  const collections = (await CollectionModel.find({
    createdBy: context.user._id,
  }).lean()) as unknown as CollectionDocument[];

  return collections.sort((a, b) => {
    if (a.isSystem && !b.isSystem) return -1;
    if (!a.isSystem && b.isSystem) return 1;
    if (a.pinnedAt && !b.pinnedAt) return -1;
    if (!a.pinnedAt && b.pinnedAt) return 1;
    return new Date(b.lastAdd).getTime() - new Date(a.lastAdd).getTime();
  });
};

export const getCollection = async (
  context: RequestContext,
  name: string
): Promise<CollectionDocument> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const collection = (await CollectionModel.findOne({
    createdBy: context.user._id,
    name,
  }).lean()) as CollectionDocument | null;

  if (!collection) {
    throw new GraphQLError("Collection not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return collection;
};

export const getCollectionById = async (
  context: RequestContext,
  id: string
): Promise<CollectionDocument | null> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const collection = (await CollectionModel.findOne({
    _id: id,
    createdBy: context.user._id,
  }).lean()) as CollectionDocument | null;

  return collection;
};

export const createCollection = async (
  context: RequestContext,
  input: CollectionModule.CreateCollectionInput
): Promise<CollectionDocument> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const { name, color } = input;

  if (!name || !name.trim()) {
    throw new GraphQLError("Collection name cannot be empty", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  if (name.trim().toLowerCase() === ALL_SAVED_NAME.toLowerCase()) {
    throw new GraphQLError(
      `"${ALL_SAVED_NAME}" is a reserved collection name`,
      {
        extensions: { code: "BAD_USER_INPUT" },
      }
    );
  }

  const existing = await CollectionModel.findOne({
    createdBy: context.user._id,
    name: name.trim(),
  });

  if (existing) {
    throw new GraphQLError(`Collection "${name}" already exists`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const collection = await CollectionModel.create({
    createdBy: context.user._id,
    name: name.trim(),
    color: color ?? undefined,
    isSystem: false,
    lastAdd: new Date(),
    classes: [],
  });

  return collection.toObject() as unknown as CollectionDocument;
};

export const updateCollection = async (
  context: RequestContext,
  id: string,
  input: CollectionModule.UpdateCollectionInput
): Promise<CollectionDocument> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const collection = await CollectionModel.findOne({
    _id: id,
    createdBy: context.user._id,
  });

  if (!collection) {
    throw new GraphQLError("Collection not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const update: Record<string, unknown> = {};

  if (input.name !== undefined && input.name !== null) {
    if (collection.isSystem) {
      throw new GraphQLError("System collections cannot be renamed", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    if (!input.name.trim()) {
      throw new GraphQLError("Collection name cannot be empty", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    if (input.name.trim().toLowerCase() === ALL_SAVED_NAME.toLowerCase()) {
      throw new GraphQLError(
        `"${ALL_SAVED_NAME}" is a reserved collection name`,
        {
          extensions: { code: "BAD_USER_INPUT" },
        }
      );
    }

    if (input.name.trim() !== collection.name) {
      const existing = await CollectionModel.findOne({
        createdBy: context.user._id,
        name: input.name.trim(),
      });

      if (existing) {
        throw new GraphQLError(`Collection "${input.name}" already exists`, {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
    }

    update.name = input.name.trim();
  }

  if (input.color !== undefined) {
    update.color = input.color;
  }

  if (input.pinned !== undefined && input.pinned !== null) {
    if (collection.isSystem) {
      throw new GraphQLError(
        "System collections cannot be pinned or unpinned",
        {
          extensions: { code: "FORBIDDEN" },
        }
      );
    }
    update.pinnedAt = input.pinned ? new Date() : null;
  }

  const result = await CollectionModel.findByIdAndUpdate(id, update, {
    new: true,
  });

  if (!result) {
    throw new GraphQLError("Collection not found after update", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return result.toObject() as unknown as CollectionDocument;
};

export const deleteCollection = async (
  context: RequestContext,
  id: string
): Promise<boolean> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const collection = await CollectionModel.findOne({
    _id: id,
    createdBy: context.user._id,
  });

  if (!collection) {
    throw new GraphQLError("Collection not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  if (collection.isSystem) {
    throw new GraphQLError("System collections cannot be deleted", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  await CollectionModel.deleteOne({ _id: id });

  return true;
};

export const addClassToCollection = async (
  context: RequestContext,
  input: CollectionModule.AddClassInput
): Promise<CollectionDocument> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const {
    collectionId,
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    classNumber,
  } = input;

  const classExists = await ClassModel.findOne({
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    number: classNumber,
  });

  if (!classExists) {
    throw new GraphQLError("Class not found in catalog", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  const classIdentifier = {
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    classNumber,
  };

  const classIdentifierWithTimestamp = {
    ...classIdentifier,
    addedAt: new Date(),
  };

  const targetCollection = await CollectionModel.findOne({
    _id: collectionId,
    createdBy: context.user._id,
  });

  if (!targetCollection) {
    throw new GraphQLError("Collection not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // Also add to "All Saved" when adding to a non-system collection
  if (!targetCollection.isSystem) {
    const allSaved = await getOrCreateAllSaved(context);
    await CollectionModel.findOneAndUpdate(
      {
        _id: allSaved._id,
        createdBy: context.user._id,
        classes: { $not: { $elemMatch: classIdentifier } },
      },
      {
        $push: { classes: classIdentifierWithTimestamp },
        $set: { lastAdd: new Date() },
      }
    );
  }

  const alreadyInCollection = targetCollection.classes?.some(
    (c) =>
      c.year === year &&
      c.semester === semester &&
      c.sessionId === sessionId &&
      c.subject === subject &&
      c.courseNumber === courseNumber &&
      c.classNumber === classNumber
  );

  if (alreadyInCollection) {
    return targetCollection.toObject() as unknown as CollectionDocument;
  }

  const result = await CollectionModel.findOneAndUpdate(
    {
      _id: collectionId,
      createdBy: context.user._id,
    },
    {
      $push: { classes: classIdentifierWithTimestamp },
      $set: { lastAdd: new Date() },
    },
    { new: true }
  );

  if (!result) {
    throw new GraphQLError("Collection not found after update", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return result.toObject() as unknown as CollectionDocument;
};

export const removeClassFromCollection = async (
  context: RequestContext,
  input: CollectionModule.RemoveClassInput
): Promise<CollectionDocument> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const {
    collectionId,
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    classNumber,
  } = input;

  const classIdentifier = {
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    classNumber,
  };

  const targetCollection = await CollectionModel.findOne({
    _id: collectionId,
    createdBy: context.user._id,
  });

  if (!targetCollection) {
    throw new GraphQLError("Collection not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  const classInCollection = targetCollection.classes?.some(
    (c) =>
      c.year === year &&
      c.semester === semester &&
      c.sessionId === sessionId &&
      c.subject === subject &&
      c.courseNumber === courseNumber &&
      c.classNumber === classNumber
  );

  if (!classInCollection) {
    throw new GraphQLError("Class not found in collection", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // Removing from "All Saved" cascades to all collections
  if (targetCollection.isSystem) {
    await CollectionModel.updateMany(
      {
        createdBy: context.user._id,
      },
      {
        $pull: { classes: classIdentifier },
      }
    );

    const updatedAllSaved = await CollectionModel.findById(collectionId).lean();
    if (!updatedAllSaved) {
      throw new GraphQLError("Collection not found after update", {
        extensions: { code: "NOT_FOUND" },
      });
    }
    return updatedAllSaved as unknown as CollectionDocument;
  }

  const result = await CollectionModel.findOneAndUpdate(
    {
      _id: collectionId,
      createdBy: context.user._id,
    },
    {
      $pull: { classes: classIdentifier },
    },
    { new: true }
  );

  if (!result) {
    throw new GraphQLError("Collection not found after update", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return result.toObject() as unknown as CollectionDocument;
};

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
  if (!context.user?._id) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  // Verify caller is a staff member
  const staffMember = await StaffMemberModel.findOne({
    userId: context.user._id,
  }).lean();

  if (!staffMember) {
    throw new GraphQLError("Only staff members can access analytics data", {
      extensions: { code: "FORBIDDEN" },
    });
  }

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
