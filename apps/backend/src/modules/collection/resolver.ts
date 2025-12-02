import { GraphQLError } from "graphql";

import { ClassModel, IClassItem } from "@repo/common";

import { formatClass } from "../class/formatter";
import { CollectionDocument, StoredClassEntry } from "./controller";
import * as controller from "./controller";
import { CollectionModule } from "./generated-types/module-types";

// classes is StoredClassEntry[] here, transformed by Collection.classes resolver
interface CollectionParent {
  _id: string;
  createdBy: string;
  name: string;
  color: CollectionModule.CollectionColor | null;
  pinnedAt: string | null;
  isSystem: boolean;
  classes: StoredClassEntry[];
  createdAt: string;
  updatedAt: string;
}

const mapCollectionToGraphQL = (
  collection: CollectionDocument
): CollectionModule.Collection => {
  const parent: CollectionParent = {
    _id: collection._id.toString(),
    createdBy: collection.createdBy,
    name: collection.name,
    color: (collection.color as CollectionModule.CollectionColor) ?? null,
    pinnedAt: collection.pinnedAt
      ? collection.pinnedAt instanceof Date
        ? collection.pinnedAt.toISOString()
        : String(collection.pinnedAt)
      : null,
    isSystem: collection.isSystem,
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

    myCollectionById: async (_, { id }, context) => {
      try {
        const collection = await controller.getCollectionById(context, id);
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
    createCollection: async (_, { input }, context) => {
      try {
        const collection = await controller.createCollection(context, input);
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

    updateCollection: async (_, { id, input }, context) => {
      try {
        const collection = await controller.updateCollection(
          context,
          id,
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

    deleteCollection: async (_, { id }, context) => {
      try {
        return await controller.deleteCollection(context, id);
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
    classes: async (parent) => {
      const typedParent = parent as unknown as CollectionParent;

      if (!typedParent.classes || typedParent.classes.length === 0) {
        return [];
      }

      const sortedClasses = [...typedParent.classes].sort((a, b) => {
        const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
        const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
        return dateB - dateA;
      });

      const classQueries = sortedClasses.map((classEntry) => ({
        year: classEntry.year,
        semester: classEntry.semester,
        sessionId: classEntry.sessionId,
        subject: classEntry.subject,
        courseNumber: classEntry.courseNumber,
        number: classEntry.classNumber,
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

      return sortedClasses.map(
        (classEntry): CollectionModule.CollectionClass => {
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
              error: "CLASS_NOT_FOUND_IN_CATALOG",
              addedAt: classEntry.addedAt
                ? new Date(classEntry.addedAt).toISOString()
                : null,
            };
          }

          const formattedClass = formatClass(classData as IClassItem);

          return {
            class: formattedClass as unknown as CollectionModule.Class,
            error: null,
            addedAt: classEntry.addedAt
              ? new Date(classEntry.addedAt).toISOString()
              : null,
          };
        }
      );
    },
  },
};

export default resolvers;
