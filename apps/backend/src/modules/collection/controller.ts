import { GraphQLError } from "graphql";
import { Types } from "mongoose";

import { ClassModel, CollectionModel } from "@repo/common";

import { CollectionModule } from "./generated-types/module-types";

const MAX_PERSONAL_NOTE_LENGTH = 5000;

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
  personalNote?: {
    text: string;
    updatedAt: Date;
  };
}

// Type for collection documents returned from MongoDB
export interface CollectionDocument {
  _id: Types.ObjectId;
  createdBy: string;
  name: string;
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

export const renameCollection = async (
  context: RequestContext,
  oldName: string,
  newName: string
): Promise<CollectionDocument> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  // Validate new name
  if (!newName || newName.trim().length === 0) {
    throw new GraphQLError("New collection name cannot be empty", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  // Find collection (with ownership verification)
  const collection = await CollectionModel.findOne({
    createdBy: context.user._id,
    name: oldName,
  });

  if (!collection) {
    throw new GraphQLError("Collection not found", {
      extensions: { code: "NOT_FOUND" },
    });
  }

  // Check new name doesn't conflict
  const existing = await CollectionModel.findOne({
    createdBy: context.user._id,
    name: newName,
  });

  if (existing) {
    throw new GraphQLError(`Collection "${newName}" already exists`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  // Update name
  collection.name = newName;
  await collection.save();

  return collection.toObject() as unknown as CollectionDocument;
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
    personalNote,
  } = input;

  // Validate collection name
  if (!collectionName || collectionName.trim().length === 0) {
    throw new GraphQLError("Collection name cannot be empty", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  // Validate personal note length
  if (personalNote && personalNote.text.length > MAX_PERSONAL_NOTE_LENGTH) {
    throw new GraphQLError(
      `Personal note cannot exceed ${MAX_PERSONAL_NOTE_LENGTH} characters`,
      { extensions: { code: "BAD_USER_INPUT" } }
    );
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

  // Normalize personalNote: treat empty/whitespace text as undefined
  const normalizedPersonalNote =
    personalNote && personalNote.text.trim().length > 0
      ? {
          text: personalNote.text.trim(),
          updatedAt: new Date(),
        }
      : undefined;

  const classIdentifier = {
    year,
    semester,
    sessionId,
    subject,
    courseNumber,
    classNumber,
  };

  // Try to update existing class's note in collection
  let result = await CollectionModel.findOneAndUpdate(
    {
      createdBy: context.user._id,
      name: collectionName,
      classes: { $elemMatch: classIdentifier },
    },
    {
      $set: { "classes.$.personalNote": normalizedPersonalNote },
    },
    { new: true }
  );

  if (result) {
    return result.toObject() as unknown as CollectionDocument;
  }

  // Add class to existing or new collection
  result = await CollectionModel.findOneAndUpdate(
    {
      createdBy: context.user._id,
      name: collectionName,
    },
    {
      $setOnInsert: { createdBy: context.user._id, name: collectionName },
      $push: {
        classes: { ...classIdentifier, personalNote: normalizedPersonalNote },
      },
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
