import { GraphQLError, GraphQLScalarType, Kind } from "graphql";

import { UserModel } from "@repo/common";

import { getClass } from "../class/controller";
import { formatUser } from "../user/formatter";
import {
  addDiscussion,
  deleteDiscussion,
  getDiscussionsByClass,
  getDiscussionsByUser,
} from "./controller";
import { IntermediateDiscussion } from "./formatter";
import { DiscussionModule } from "./generated-types/module-types";

const resolvers: DiscussionModule.Resolvers = {
  DiscussionIdentifier: new GraphQLScalarType({
    name: "DiscussionIdentifier",
    parseValue: (value) => value,
    serialize: (value) => value,
    description: "Unique discussion identifier",
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) return ast.value;

      throw new GraphQLError("Provided value is not a discussion identifier", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    },
  }),

  Query: {
    discussionsByClass: async (
      _,
      { year, semester, sessionId, subject, courseNumber, classNumber },
      _context,
      _info
    ) => {
      console.log("Query discussionsByClass with:", {
        year,
        semester,
        sessionId,
        subject,
        courseNumber,
        classNumber,
      });

      const discussions = await getDiscussionsByClass(
        year,
        semester,
        sessionId,
        subject,
        courseNumber,
        classNumber
      );

      console.log("Found discussions:", discussions.length);
      if (discussions.length > 0) {
        console.log(
          "First discussion sample:",
          JSON.stringify(discussions[0], null, 2)
        );
      }

      // Ensure we're returning proper array
      const result = discussions as unknown as DiscussionModule.Discussion[];
      console.log(
        "Returning to GraphQL - type:",
        typeof result,
        "isArray:",
        Array.isArray(result),
        "length:",
        result?.length
      );

      return result;
    },

    discussionsByUser: async (_, { userId }, _context, _info) => {
      const discussions = await getDiscussionsByUser(userId);

      return discussions as unknown as DiscussionModule.Discussion[];
    },
  },

  Mutation: {
    addDiscussion: async (
      _,
      {
        year,
        semester,
        sessionId,
        subject,
        courseNumber,
        classNumber,
        content,
      },
      context,
      _info
    ) => {
      // Get userId from context - safely handle different context structures
      let userId = "anonymous";

      try {
        if (context && context.user && context.user._id) {
          userId = context.user._id;
        }
      } catch (err) {
        console.log("Could not get user from context:", err);
      }

      console.log(
        "Adding discussion with userId:",
        userId,
        "full context:",
        JSON.stringify(context, null, 2)
      );

      const discussion = await addDiscussion(
        year,
        semester,
        sessionId,
        subject,
        courseNumber,
        classNumber,
        userId,
        content
      );

      return discussion as unknown as DiscussionModule.Discussion;
    },

    deleteDiscussion: async (_, { discussionId }, _context, _info) => {
      const success = await deleteDiscussion(discussionId);

      return success;
    },
  },

  Discussion: {
    class: async (
      parent: IntermediateDiscussion | DiscussionModule.Discussion
    ) => {
      if (parent.class) return parent.class;

      // Parse classId to get class identifiers
      const [year, semester, sessionId, subject, courseNumber, classNumber] =
        parent.classId.split("-");

      const _class = await getClass(
        parseInt(year),
        semester,
        sessionId,
        subject,
        courseNumber,
        classNumber
      );

      return _class as unknown as DiscussionModule.Class;
    },

    user: async (
      parent: IntermediateDiscussion | DiscussionModule.Discussion
    ) => {
      if (parent.user) return parent.user;

      // Return null for anonymous users
      if (!parent.userId || parent.userId === "anonymous") {
        return null;
      }

      try {
        // Fetch user directly by ID
        const user = await UserModel.findById(parent.userId).lean();

        if (!user) {
          console.log(`User not found for userId: ${parent.userId}`);
          return null;
        }

        return formatUser(user as any) as unknown as DiscussionModule.User;
      } catch (error) {
        console.log("Error fetching user for discussion:", error);
        console.log("Parent userId:", parent.userId);
        return null;
      }
    },
  },
};

export default resolvers;
