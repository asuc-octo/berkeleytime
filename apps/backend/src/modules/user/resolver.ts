import { deleteAccount, getMonitoredClasses, getUser, updateUser } from "./controller";
import { UserModule } from "./generated-types/module-types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolvers: any = {
  Query: {
    user: async (_, __, context) => {
      const user = await getUser(context);

      return user as unknown as UserModule.User;
    },
  },

  User: {
    monitoredClasses: async (parent) => {
      const classes = await getMonitoredClasses(
        (parent as unknown as { _id: string })._id
      );

      return classes as unknown as UserModule.MonitoredClass[];
    },
  },

  Mutation: {
    updateUser: async (_, { user: input }, context) => {
      const user = await updateUser(context, input as any);

      return user as unknown as UserModule.User;
    },
    deleteAccount: async (_, __, context) => {
      return await deleteAccount(context);
    },
  },
};

export default resolvers;
