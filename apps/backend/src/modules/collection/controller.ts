import { GraphQLError } from "graphql";

import { ClassModel, CollectionModel } from "@repo/common";

import { CollectionModule } from "./generated-types/module-types";

export interface RequestContext {
  user: {
    _id?: string;
    isAuthenticated: boolean;
  };
}

// Collection-Level Operations

export const getAllCollections = async (
  context: RequestContext
): Promise<any[]> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return await CollectionModel.find({
    createdBy: context.user._id,
  }).lean();
};

export const getCollection = async (
  context: RequestContext,
  name: string
): Promise<any> => {
  if (!context.user._id) {
    throw new GraphQLError("Unauthorized", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  const collection = await CollectionModel.findOne({
    createdBy: context.user._id,
    name,
  }).lean();

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
): Promise<any> => {
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

  return collection.toObject();
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
): Promise<any> => {
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
    return result.toObject();
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

  return result!.toObject();
};

export const removeClassFromCollection = async (
  context: RequestContext,
  input: CollectionModule.RemoveClassInput
): Promise<any> => {
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

  return result.toObject();
};
