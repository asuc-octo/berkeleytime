import { ClassModel, IClassItem } from "@repo/common/models";

import { formatClass } from "../class/formatter";
import { deleteAccount, getUser, updateUser } from "./controller";
import { UserModule } from "./generated-types/module-types";

const resolvers: UserModule.Resolvers = {
  Query: {
    user: async (_, __, context) => {
      const user = await getUser(context);

      return user as unknown as UserModule.User;
    },
  },

  MonitoredClass: {
    // Subscriptions only store a class reference; look up the full class so
    // clients can render it, falling back to the reference if it's gone
    class: async (parent) => {
      const { year, semester, sessionId, subject, courseNumber, number } =
        parent.class;

      const _class = await ClassModel.findOne({
        year,
        semester,
        subject,
        courseNumber,
        number,
        ...(sessionId ? { sessionId } : {}),
      }).lean();

      return (_class
        ? formatClass(_class as IClassItem)
        : parent.class) as unknown as UserModule.MonitoredClass["class"];
    },
  },

  Mutation: {
    updateUser: async (_, { user: input }, context) => {
      const user = await updateUser(context, input);

      return user as unknown as UserModule.User;
    },
    deleteAccount: async (_, __, context) => {
      return await deleteAccount(context);
    },
  },
};

export default resolvers;
