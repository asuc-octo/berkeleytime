import { GraphQLError } from "graphql";

import { ClassModel } from "@repo/common";

import {
  CollectionDocument,
  StoredClassEntry,
} from "./controller";
import * as controller from "./controller";
import { CollectionModule } from "./generated-types/module-types";

// Intermediate type for parent passed to Collection field resolvers
// Note: classes is StoredClassEntry[] here, transformed by Collection.classes resolver
interface CollectionParent {
  _id: string;
  createdBy: string;
  name: string;
  classes: StoredClassEntry[];
  createdAt: string;
  updatedAt: string;
}

// Helper to map Collection document to GraphQL response
// Returns CollectionParent which will be resolved by field resolvers
const mapCollectionToGraphQL = (
  collection: CollectionDocument
): CollectionModule.Collection => {
  const parent: CollectionParent = {
    _id: collection._id.toString(),
    createdBy: collection.createdBy,
    name: collection.name,
    classes: collection.classes,
    createdAt:
      collection.createdAt instanceof Date
        ? collection.createdAt.toISOString()
        : String(collection.createdAt),
    updatedAt:
      collection.updatedAt instanceof Date
        ? collection.updatedAt.toISOString()
        : String(collection.updatedAt),
  };
  // Cast is safe: Collection.classes resolver transforms StoredClassEntry[] to CollectionClass[]
  return parent as unknown as CollectionModule.Collection;
};

const resolvers: CollectionModule.Resolvers = {
  Query: {
    myCollections: async (_, __, context) => {
      try {
        const collections = await controller.getAllCollections(context);
        return collections.map(mapCollectionToGraphQL);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },

    myCollection: async (_, { name }, context) => {
      try {
        const collection = await controller.getCollection(context, name);
        if (!collection) {
          return null;
        }
        return mapCollectionToGraphQL(collection);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },
  },

  Mutation: {
    renameCollection: async (_, { oldName, newName }, context) => {
      try {
        const collection = await controller.renameCollection(
          context,
          oldName,
          newName
        );
        return mapCollectionToGraphQL(collection);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },

    deleteCollection: async (_, { name }, context) => {
      try {
        return await controller.deleteCollection(context, name);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },

    addClassToCollection: async (_, { input }, context) => {
      try {
        const collection = await controller.addClassToCollection(
          context,
          input
        );
        return mapCollectionToGraphQL(collection);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },

    removeClassFromCollection: async (_, { input }, context) => {
      try {
        const collection = await controller.removeClassFromCollection(
          context,
          input
        );
        return mapCollectionToGraphQL(collection);
      } catch (error: unknown) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unexpected error occurred",
          { extensions: { code: "INTERNAL_SERVER_ERROR" } }
        );
      }
    },
  },

  Collection: {
    // Resolve classes with their full class info
    classes: async (parent) => {
      const typedParent = parent as CollectionParent;

      // Guard: Return early if no classes in collection
      if (!typedParent.classes || typedParent.classes.length === 0) {
        return [];
      }

      // Build batch query for all classes
      const classQueries = typedParent.classes.map((classEntry) => ({
        year: classEntry.year,
        semester: classEntry.semester,
        sessionId: classEntry.sessionId,
        subject: classEntry.subject,
        courseNumber: classEntry.courseNumber,
        number: classEntry.classNumber, // Note: classNumber -> number
      }));

      const allClasses = await ClassModel.find({
        $or: classQueries,
      }).lean();

      const classMap = new Map(
        allClasses.map((c) => [
          `${c.year}|${c.semester}|${c.sessionId}|${c.subject}|${c.courseNumber}|${c.number}`,
          c,
        ])
      );

      // Helper to format personal note
      const formatPersonalNote = (note: StoredClassEntry["personalNote"]) =>
        note
          ? {
              text: note.text,
              updatedAt:
                note.updatedAt instanceof Date
                  ? note.updatedAt.toISOString()
                  : String(note.updatedAt),
            }
          : null;

      return typedParent.classes.map((classEntry): CollectionModule.CollectionClass => {
        const key = `${classEntry.year}|${classEntry.semester}|${classEntry.sessionId}|${classEntry.subject}|${classEntry.courseNumber}|${classEntry.classNumber}`;
        const classData = classMap.get(key);

        if (!classData) {
          console.warn(`Class not found in catalog:`, {
            year: classEntry.year,
            semester: classEntry.semester,
            sessionId: classEntry.sessionId,
            subject: classEntry.subject,
            courseNumber: classEntry.courseNumber,
            number: classEntry.classNumber,
          });

          return {
            class: null,
            personalNote: formatPersonalNote(classEntry.personalNote),
            error: "CLASS_NOT_FOUND_IN_CATALOG",
          };
        }

        return {
          // Cast to Class - nested fields resolved by Class field resolvers
          class: classData as unknown as CollectionModule.Class,
          personalNote: formatPersonalNote(classEntry.personalNote),
          error: null,
        };
      });
    },
  },
};

export default resolvers;
