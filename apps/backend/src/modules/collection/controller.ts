import { GraphQLError } from "graphql";
import { Types } from "mongoose";

import { ClassModel, CollectionColor, CollectionModel } from "@repo/common";

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
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
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
