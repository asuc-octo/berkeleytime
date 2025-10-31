import {
  getBookmarkedClasses,
  getBookmarkedCourses,
  getMonitoredClasses,
  getUser,
  updateUser,
} from "./controller";
import { IntermediateUser } from "./formatter";
import { UserModule } from "./generated-types/module-types";

const resolvers: UserModule.Resolvers = {
  Query: {
    user: async (_, __, context) => {
      const user = await getUser(context);

      return user as unknown as UserModule.User;
    },
  },

  User: {
    bookmarkedClasses: async (parent: UserModule.User | IntermediateUser) => {
      if (
        parent.bookmarkedClasses[0] &&
        (parent.bookmarkedClasses[0] as UserModule.Class).title
      )
        return parent.bookmarkedClasses as UserModule.Class[];

      const classes = await getBookmarkedClasses(parent.bookmarkedClasses);

      return classes as unknown as UserModule.Class[];
    },

    bookmarkedCourses: async (parent: UserModule.User | IntermediateUser) => {
      if (
        parent.bookmarkedCourses[0] &&
        (parent.bookmarkedCourses[0] as UserModule.Course).title
      )
        return parent.bookmarkedCourses as UserModule.Course[];

      const courses = await getBookmarkedCourses(parent.bookmarkedCourses);

      return courses as unknown as UserModule.Course[];
    },

    monitoredClasses: async (parent: UserModule.User | IntermediateUser) => {
      if (
        parent.monitoredClasses[0] &&
        (parent.monitoredClasses[0] as UserModule.MonitoredClass).class
      ) {
        return parent.monitoredClasses as UserModule.MonitoredClass[];
      }

      const monitoredClasses = await getMonitoredClasses(
        parent.monitoredClasses
      );

      return monitoredClasses as unknown as UserModule.MonitoredClass[];
    },
  },

  Mutation: {
    updateUser: async (_, { user: input }, context) => {
      const user = await updateUser(context, input);

      return user as unknown as UserModule.User;
    },
  },
};

export default resolvers;
