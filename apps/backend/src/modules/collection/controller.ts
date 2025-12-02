import { GraphQLError } from "graphql";
import { Types } from "mongoose";

import { ClassModel, CollectionModel, CollectionColor } from "@repo/common";

import { CollectionModule } from "./generated-types/module-types";

export interface RequestContext {
  user: {
    _id?: string;
    isAuthenticated: boolean;
  };
}

// Type for stored class entries in MongoDB
export interface StoredClassEntry {
  year: number;
  semester: string;
  sessionId: string;
  subject: string;
  courseNumber: string;
  classNumber: string;
  addedAt: Date;
}

// Type for collection documents returned from MongoDB
export interface CollectionDocument {
  _id: Types.ObjectId;
  createdBy: string;
  name: string;
  color?: CollectionColor;
  pinnedAt?: Date;
  isSystem: boolean;
  classes: StoredClassEntry[];
  createdAt: Date;
  updatedAt: Date;
}

// Constants
export const ALL_SAVED_NAME = "All Saved";

// Helper: Get or create the "All Saved" system collection for a user
export const getOrCreateAllSaved = async (
  context: RequestContext
): Promise<CollectionDocument> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  // Try to find existing "All Saved" collection
  let allSaved = await CollectionModel.findOne({
    createdBy: context.user._id,
    isSystem: true,
    name: ALL_SAVED_NAME,
  });

  if (!allSaved) {
    // Create "All Saved" collection
    // For existing users, populate with union of all classes from their collections
    const existingCollections = await CollectionModel.find({
      createdBy: context.user._id,
    }).lean();

    // Collect all unique classes from existing collections
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
      pinnedAt: new Date(), // System collections are always pinned
      classes: Array.from(allClassesMap.values()),
    });
  }

  return allSaved.toObject() as unknown as CollectionDocument;
};

// Collection-Level Operations

export const getAllCollections = async (
  context: RequestContext
): Promise<CollectionDocument[]> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  // Ensure "All Saved" exists for this user
  await getOrCreateAllSaved(context);

  const collections = (await CollectionModel.find({
    createdBy: context.user._id,
  }).lean()) as unknown as CollectionDocument[];

  // Sort: system collections first, then pinned, then by creation date
  return collections.sort((a, b) => {
    // System collections first
    if (a.isSystem && !b.isSystem) return -1;
    if (!a.isSystem && b.isSystem) return 1;
    // Then pinned
    if (a.pinnedAt && !b.pinnedAt) return -1;
    if (!a.pinnedAt && b.pinnedAt) return 1;
    // Then by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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

  // Query by ID, still verify ownership
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

  // Validate name
  if (!name || !name.trim()) {
    throw new GraphQLError("Collection name cannot be empty", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  // Prevent using reserved system collection names
  if (name.trim().toLowerCase() === ALL_SAVED_NAME.toLowerCase()) {
    throw new GraphQLError(`"${ALL_SAVED_NAME}" is a reserved collection name`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  // Check if name already exists for this user
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

  // Find collection by ID (with ownership verification)
  const collection = await CollectionModel.findOne({
    _id: id,
    createdBy: context.user._id,
  });

  if (!collection) {
    throw new GraphQLError("Collection not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // Build update object with only provided fields
  const update: Record<string, unknown> = {};

  if (input.name !== undefined && input.name !== null) {
    // System collections cannot be renamed
    if (collection.isSystem) {
      throw new GraphQLError("System collections cannot be renamed", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    // Validate new name
    if (!input.name.trim()) {
      throw new GraphQLError("Collection name cannot be empty", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    // Prevent renaming to reserved names
    if (input.name.trim().toLowerCase() === ALL_SAVED_NAME.toLowerCase()) {
      throw new GraphQLError(`"${ALL_SAVED_NAME}" is a reserved collection name`, {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    // Check new name doesn't conflict (unless it's the same name)
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
    update.color = input.color; // null clears the color
  }

  // Backend generates timestamp - prevents client-side injection
  // System collections cannot be pinned/unpinned (they are always pinned)
  if (input.pinned !== undefined && input.pinned !== null) {
    if (collection.isSystem) {
      throw new GraphQLError("System collections cannot be pinned or unpinned", {
        extensions: { code: "FORBIDDEN" },
      });
    }
    update.pinnedAt = input.pinned ? new Date() : null;
  }

  const result = await CollectionModel.findByIdAndUpdate(id, update, {
    new: true,
  });

  return result!.toObject() as unknown as CollectionDocument;
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

  // Find collection first to check if it's a system collection
  const collection = await CollectionModel.findOne({
    _id: id,
    createdBy: context.user._id,
  });

  if (!collection) {
    throw new GraphQLError("Collection not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // System collections cannot be deleted
  if (collection.isSystem) {
    throw new GraphQLError("System collections cannot be deleted", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  await CollectionModel.deleteOne({ _id: id });

  return true;
};

// Class-Level Operations

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

  // Verify class exists in catalog
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

  // Find the target collection first
  const targetCollection = await CollectionModel.findOne({
    _id: collectionId,
    createdBy: context.user._id,
  });

  if (!targetCollection) {
    throw new GraphQLError("Collection not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // If adding to a non-system collection, also add to "All Saved" first
  if (!targetCollection.isSystem) {
    const allSaved = await getOrCreateAllSaved(context);

    // Add to "All Saved" if not already there
    await CollectionModel.findOneAndUpdate(
      {
        _id: allSaved._id,
        createdBy: context.user._id,
        classes: { $not: { $elemMatch: classIdentifier } },
      },
      {
        $push: { classes: classIdentifierWithTimestamp },
      }
    );
  }

  // Check if class already exists in target collection
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
    // Class already in collection, return as-is
    return targetCollection.toObject() as unknown as CollectionDocument;
  }

  // Add class to target collection
  const result = await CollectionModel.findOneAndUpdate(
    {
      _id: collectionId,
      createdBy: context.user._id,
    },
    {
      $push: { classes: classIdentifierWithTimestamp },
    },
    { new: true }
  );

  return result!.toObject() as unknown as CollectionDocument;
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

  // Find the target collection first to check if it's a system collection
  const targetCollection = await CollectionModel.findOne({
    _id: collectionId,
    createdBy: context.user._id,
  });

  if (!targetCollection) {
    throw new GraphQLError("Collection not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // Check if the class is in the collection
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

  // If removing from "All Saved" (system collection), cascade remove from ALL collections
  if (targetCollection.isSystem) {
    await CollectionModel.updateMany(
      {
        createdBy: context.user._id,
      },
      {
        $pull: { classes: classIdentifier },
      }
    );

    // Return the updated "All Saved" collection
    const updatedAllSaved = await CollectionModel.findById(collectionId).lean();
    return updatedAllSaved as unknown as CollectionDocument;
  }

  // Regular collection: just remove from this collection
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

  return result!.toObject() as unknown as CollectionDocument;
};
