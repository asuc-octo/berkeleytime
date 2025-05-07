import {getPosts, updatePost, deletePost, createPost, getPostById} from "./controller";
import { SuggestedClassesModule } from "./generated-types/module-types";
import { GraphQLScalarType, Kind, GraphQLError } from "graphql";

// Define scalar types separately
export const SuggestedClassesScalars = {
  UUID: new GraphQLScalarType({
    name: "UUID",
    description: "UUID scalar type for unique post identification",
    parseValue: (value) => value,
    serialize: (value) => value,
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(ast.value)) {
          return ast.value;
        }
      }
      throw new GraphQLError("Provided value is not a valid UUID", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    },
  }),

  Semester: new GraphQLScalarType({
    name: "Semester",
    description: "Semester scalar type (e.g., 'Fall', 'Spring', 'Summer')",
    parseValue: (value) => value,
    serialize: (value) => value,
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        const validSemesters = ["Fall", "Spring", "Summer"];
        if (validSemesters.includes(ast.value)) {
          return ast.value;
        }
      }
      throw new GraphQLError("Invalid semester value. Must be 'Fall', 'Spring', or 'Summer'", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    },
  }),

  CourseNumber: new GraphQLScalarType({
    name: "CourseNumber",
    description: "Course number scalar type",
    parseValue: (value) => value,
    serialize: (value) => value,
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        const courseNumberRegex = /^\d+[A-Z]?$/;
        if (courseNumberRegex.test(ast.value)) {
          return ast.value;
        }
      }
      throw new GraphQLError("Invalid course number format", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    },
  }),
};

const resolvers: SuggestedClassesModule.Resolvers = {
    Query: {
        getAllPosts: async (_: any, context: any) => {
            const posts = await getPosts(context);
            return posts as unknown as SuggestedClassesModule.Post[];
        },
        getPost: async (_: any, {postId: input}: any , context: any) => {
            const post = await getPostById(context, input);
            return post as unknown as SuggestedClassesModule.Post;
        }
    }, 
    
    Mutation: {
        addPost: async (_: any, {newPost: input}: any, context: any) => {
            const post = await createPost(context, input);
            return post as unknown as SuggestedClassesModule.Post;
        }, 

        modifyPost: async (_:any, {courseNumber, post: input}: any, context: any) => {
            const post = await updatePost(context, courseNumber, input);
            return post as unknown as SuggestedClassesModule.Post;
        }, 

        deletePost: async (_: any, {courseNumber}: any, context: any) => {
            return await deletePost(context, courseNumber);
        }
        }
    };

export default {
  ...resolvers,
  ...SuggestedClassesScalars
};