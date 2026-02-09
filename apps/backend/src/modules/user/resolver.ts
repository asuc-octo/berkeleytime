import { deleteAccount, getUser, updateUser } from "./controller";
import { UserModule } from "./generated-types/module-types";

const resolvers: UserModule.Resolvers = {
  Query: {
    user: async (_, __, context) => {
      return getUser(context);
    },
  },

  Mutation: {
    updateUser: async (_, { user: input }, context) => {
      return updateUser(context, input);
    },
    deleteAccount: async (_, __, context) => {
      return await deleteAccount(context);
    },
  },
};

export default resolvers;
