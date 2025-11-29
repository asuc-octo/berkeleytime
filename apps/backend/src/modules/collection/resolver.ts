import { GraphQLError } from "graphql";

import { ClassModel } from "@repo/common";

import * as controller from "./controller";
import { CollectionModule } from "./generated-types/module-types";

const resolvers: CollectionModule.Resolvers = {
  Query: {
    myCollections: async (_, __, context) => {
      try {
        const collections = await controller.getAllCollections(context);
        return collections.map((collection) => ({
          _id: collection._id.toString(),
          createdBy: collection.createdBy,
          name: collection.name,
          classes: collection.classes as any,
          createdAt:
            collection.createdAt instanceof Date
              ? collection.createdAt.toISOString()
              : collection.createdAt,
          updatedAt:
            collection.updatedAt instanceof Date
              ? collection.updatedAt.toISOString()
              : collection.updatedAt,
        }));
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
        return {
          _id: collection._id.toString(),
          createdBy: collection.createdBy,
          name: collection.name,
          classes: collection.classes as any,
          createdAt:
            collection.createdAt instanceof Date
              ? collection.createdAt.toISOString()
              : collection.createdAt,
          updatedAt:
            collection.updatedAt instanceof Date
              ? collection.updatedAt.toISOString()
              : collection.updatedAt,
        };
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
        return {
          _id: collection._id.toString(),
          createdBy: collection.createdBy,
          name: collection.name,
          classes: collection.classes as any,
          createdAt:
            collection.createdAt instanceof Date
              ? collection.createdAt.toISOString()
              : collection.createdAt,
          updatedAt:
            collection.updatedAt instanceof Date
              ? collection.updatedAt.toISOString()
              : collection.updatedAt,
        };
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
        return {
          _id: collection._id.toString(),
          createdBy: collection.createdBy,
          name: collection.name,
          classes: collection.classes as any,
          createdAt:
            collection.createdAt instanceof Date
              ? collection.createdAt.toISOString()
              : collection.createdAt,
          updatedAt:
            collection.updatedAt instanceof Date
              ? collection.updatedAt.toISOString()
              : collection.updatedAt,
        };
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
        return {
          _id: collection._id.toString(),
          createdBy: collection.createdBy,
          name: collection.name,
          classes: collection.classes as any,
          createdAt:
            collection.createdAt instanceof Date
              ? collection.createdAt.toISOString()
              : collection.createdAt,
          updatedAt:
            collection.updatedAt instanceof Date
              ? collection.updatedAt.toISOString()
              : collection.updatedAt,
        };
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
    classes: async (parent: any) => {
      // Build batch query for all classes
      const classQueries = parent.classes.map((classEntry: any) => ({
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

      const classesWithInfo = parent.classes.map((classEntry: any) => {
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
            personalNote: classEntry.personalNote
              ? {
                  text: classEntry.personalNote.text,
                  updatedAt:
                    classEntry.personalNote.updatedAt instanceof Date
                      ? classEntry.personalNote.updatedAt.toISOString()
                      : classEntry.personalNote.updatedAt,
                }
              : null,
            error: "CLASS_NOT_FOUND_IN_CATALOG",
          };
        }

        return {
          class: classData,
          personalNote: classEntry.personalNote
            ? {
                text: classEntry.personalNote.text,
                updatedAt:
                  classEntry.personalNote.updatedAt instanceof Date
                    ? classEntry.personalNote.updatedAt.toISOString()
                    : classEntry.personalNote.updatedAt,
              }
            : null,
          error: null,
        };
      });

      // Return all classes (including missing ones with error field)
      return classesWithInfo as any;
    },
  },
};

export default resolvers;
