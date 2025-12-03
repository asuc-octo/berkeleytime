import mongoose from "mongoose";

import { ClassModel, CollectionModel, UserModel } from "@repo/common";

import { Config } from "../shared/config";

const ALL_SAVED_NAME = "All Saved";

interface BookmarkedClass {
  year: number;
  semester: string;
  subject: string;
  courseNumber: string;
  number: string;
}

interface StoredClassEntry {
  year: number;
  semester: string;
  sessionId: string;
  subject: string;
  courseNumber: string;
  classNumber: string;
  addedAt: Date;
}

/**
 * Look up a class in the ClassModel to get its sessionId.
 * Returns null if the class is not found.
 */
const lookupClass = async (
  bookmarkedClass: BookmarkedClass
): Promise<{ sessionId: string } | null> => {
  const classDoc = await ClassModel.findOne({
    year: bookmarkedClass.year,
    semester: bookmarkedClass.semester,
    subject: bookmarkedClass.subject,
    courseNumber: bookmarkedClass.courseNumber,
    number: bookmarkedClass.number,
  })
    .select("sessionId")
    .lean();

  if (!classDoc) {
    return null;
  }

  return { sessionId: classDoc.sessionId };
};

/**
 * Transform a bookmarked class to a StoredClassEntry.
 */
const transformToStoredClassEntry = (
  bookmarkedClass: BookmarkedClass,
  sessionId: string,
  addedAt: Date
): StoredClassEntry => ({
  year: bookmarkedClass.year,
  semester: bookmarkedClass.semester,
  sessionId,
  subject: bookmarkedClass.subject,
  courseNumber: bookmarkedClass.courseNumber,
  classNumber: bookmarkedClass.number,
  addedAt,
});

/**
 * Generate a unique key for a class entry (for deduplication).
 */
const getClassKey = (entry: {
  year: number;
  semester: string;
  sessionId: string;
  subject: string;
  courseNumber: string;
  classNumber: string;
}): string =>
  `${entry.year}|${entry.semester}|${entry.sessionId}|${entry.subject}|${entry.courseNumber}|${entry.classNumber}`;

/**
 * Migrate bookmarks for a single user.
 * Returns stats about the migration.
 */
const migrateUserBookmarks = async (
  user: { _id: string; bookmarkedClasses: BookmarkedClass[] },
  migrationTimestamp: Date
): Promise<{
  migrated: number;
  skipped: number;
  notFound: number;
  alreadyExists: number;
}> => {
  const stats = { migrated: 0, skipped: 0, notFound: 0, alreadyExists: 0 };

  if (!user.bookmarkedClasses || user.bookmarkedClasses.length === 0) {
    return stats;
  }

  // Get or create "All Saved" collection for this user
  let allSaved = await CollectionModel.findOne({
    createdBy: user._id,
    isSystem: true,
    name: ALL_SAVED_NAME,
  });

  const existingClassKeys = new Set<string>();
  if (allSaved) {
    // Build set of existing class keys for deduplication
    for (const entry of allSaved.classes || []) {
      existingClassKeys.add(
        getClassKey({
          year: entry.year,
          semester: entry.semester,
          sessionId: entry.sessionId,
          subject: entry.subject,
          courseNumber: entry.courseNumber,
          classNumber: entry.classNumber,
        })
      );
    }
  }

  // Transform bookmarked classes to StoredClassEntry format
  const newClasses: StoredClassEntry[] = [];

  for (const bookmarkedClass of user.bookmarkedClasses) {
    // Look up the class to get sessionId
    const classInfo = await lookupClass(bookmarkedClass);

    if (!classInfo) {
      stats.notFound++;
      continue;
    }

    const entry = transformToStoredClassEntry(
      bookmarkedClass,
      classInfo.sessionId,
      migrationTimestamp
    );

    const key = getClassKey(entry);

    // Skip if already exists in collection
    if (existingClassKeys.has(key)) {
      stats.alreadyExists++;
      continue;
    }

    newClasses.push(entry);
    existingClassKeys.add(key); // Prevent duplicates within the same migration batch
    stats.migrated++;
  }

  if (newClasses.length === 0) {
    return stats;
  }

  if (allSaved) {
    // Merge new classes into existing collection
    await CollectionModel.updateOne(
      { _id: allSaved._id },
      {
        $push: { classes: { $each: newClasses } },
        $set: { lastAdd: migrationTimestamp },
      }
    );
  } else {
    // Create new "All Saved" collection
    await CollectionModel.create({
      createdBy: user._id,
      name: ALL_SAVED_NAME,
      isSystem: true,
      pinnedAt: migrationTimestamp,
      lastAdd: migrationTimestamp,
      classes: newClasses,
    });
  }

  return stats;
};

// Type for user documents from database (includes legacy bookmarkedClasses field)
interface UserWithLegacyBookmarks {
  _id: mongoose.Types.ObjectId;
  bookmarkedClasses?: BookmarkedClass[];
}

/**
 * Main migration function.
 * Migrates bookmarkedClasses from users collection to the new collections system.
 */
const migrateBookmarks = async (config: Config) => {
  const { log } = config;
  const logger = log.getSubLogger({ name: "BookmarkMigration" });

  logger.info("Starting bookmark migration...");

  const migrationTimestamp = new Date();

  // Find all users with non-empty bookmarkedClasses
  // Note: bookmarkedClasses is a legacy field that may still exist in the database
  // but has been removed from the TypeScript schema
  const usersWithBookmarks = (await UserModel.find({
    bookmarkedClasses: { $exists: true, $ne: [] },
  })
    .select("_id bookmarkedClasses")
    .lean()) as unknown as UserWithLegacyBookmarks[];

  logger.info(
    `Found ${usersWithBookmarks.length.toLocaleString()} users with bookmarked classes`
  );

  if (usersWithBookmarks.length === 0) {
    logger.info("No users with bookmarks found. Migration complete.");
    return;
  }

  const totalStats = {
    usersProcessed: 0,
    totalMigrated: 0,
    totalSkipped: 0,
    totalNotFound: 0,
    totalAlreadyExists: 0,
  };

  // Process users in batches to avoid memory issues
  const batchSize = 100;
  for (let i = 0; i < usersWithBookmarks.length; i += batchSize) {
    const batch = usersWithBookmarks.slice(i, i + batchSize);

    logger.trace(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(usersWithBookmarks.length / batchSize)}...`
    );

    for (const user of batch) {
      const stats = await migrateUserBookmarks(
        {
          _id: user._id.toString(),
          bookmarkedClasses: user.bookmarkedClasses || [],
        },
        migrationTimestamp
      );

      totalStats.usersProcessed++;
      totalStats.totalMigrated += stats.migrated;
      totalStats.totalSkipped += stats.skipped;
      totalStats.totalNotFound += stats.notFound;
      totalStats.totalAlreadyExists += stats.alreadyExists;
    }
  }

  logger.info("Bookmark migration complete!");
  logger.info(
    `  Users processed: ${totalStats.usersProcessed.toLocaleString()}`
  );
  logger.info(
    `  Classes migrated: ${totalStats.totalMigrated.toLocaleString()}`
  );
  logger.info(
    `  Classes not found (skipped): ${totalStats.totalNotFound.toLocaleString()}`
  );
  logger.info(
    `  Classes already in collection: ${totalStats.totalAlreadyExists.toLocaleString()}`
  );
};

export default { migrateBookmarks };
