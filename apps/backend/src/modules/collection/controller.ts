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
}

// Type for collection documents returned from MongoDB
export interface CollectionDocument {
  _id: Types.ObjectId;
  createdBy: string;
  name: string;
  color?: CollectionColor;
  pinnedAt?: Date;
  classes: StoredClassEntry[];
  createdAt: Date;
  updatedAt: Date;
}

// Collection-Level Operations

export const getAllCollections = async (
  context: RequestContext
): Promise<CollectionDocument[]> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return (await CollectionModel.find({
    createdBy: context.user._id,
  }).lean()) as unknown as CollectionDocument[];
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

export const updateCollection = async (
  context: RequestContext,
  name: string,
  input: CollectionModule.UpdateCollectionInput
): Promise<CollectionDocument> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  // Find collection (with ownership verification)
  const collection = await CollectionModel.findOne({
    createdBy: context.user._id,
    name,
  });

  if (!collection) {
    throw new GraphQLError(`Collection "${name}" not found`, {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // Build update object with only provided fields
  const update: Record<string, unknown> = {};

  if (input.name !== undefined && input.name !== null) {
    // Validate new name
    if (!input.name.trim()) {
      throw new GraphQLError("Collection name cannot be empty", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }

    // Check new name doesn't conflict (unless it's the same name)
    if (input.name.trim() !== name) {
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
  if (input.pinned !== undefined && input.pinned !== null) {
    update.pinnedAt = input.pinned ? new Date() : null;
  }

  const result = await CollectionModel.findByIdAndUpdate(collection._id, update, {
    new: true,
  });

  return result!.toObject() as unknown as CollectionDocument;
};

export const deleteCollection = async (
  context: RequestContext,
  name: string
): Promise<boolean> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const result = await CollectionModel.deleteOne({
    createdBy: context.user._id,
    name,
  });

  if (result.deletedCount === 0) {
    throw new GraphQLError("Collection not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

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
    collectionName,
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    classNumber,
  } = input;

  // Validate collection name
  if (!collectionName || collectionName.trim().length === 0) {
    throw new GraphQLError("Collection name cannot be empty", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

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

  // Check if class already exists in collection
  const existingCollection = await CollectionModel.findOne({
    createdBy: context.user._id,
    name: collectionName,
    classes: { $elemMatch: classIdentifier },
  });

  if (existingCollection) {
    // Class already in collection, return as-is
    return existingCollection.toObject() as unknown as CollectionDocument;
  }

  // Add class to existing or new collection
  const result = await CollectionModel.findOneAndUpdate(
    {
      createdBy: context.user._id,
      name: collectionName,
    },
    {
      $setOnInsert: { createdBy: context.user._id, name: collectionName },
      $push: { classes: classIdentifier },
    },
    { upsert: true, new: true }
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
    collectionName,
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

  // Atomic operation: Remove class from collection using $pull
  const result = await CollectionModel.findOneAndUpdate(
    {
      createdBy: context.user._id,
      name: collectionName,
      classes: { $elemMatch: classIdentifier },
    },
    {
      $pull: { classes: classIdentifier },
    },
    { new: true }
  );

  if (!result) {
    // Determine if collection doesn't exist or class wasn't in collection
    const collectionExists = await CollectionModel.findOne({
      createdBy: context.user._id,
      name: collectionName,
    });

    if (!collectionExists) {
      throw new GraphQLError("Collection not found", {
        extensions: { code: "NOT_FOUND" },
      });
    }

    throw new GraphQLError("Class not found in collection", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  return result.toObject() as unknown as CollectionDocument;
};
