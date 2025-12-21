import { getUser, updateUser } from "./controller";
import { UserModule } from "./generated-types/module-types";

const resolvers: UserModule.Resolvers = {
  Query: {
    user: async (_, __, context) => {
      const user = await getUser(context);

      return user as unknown as UserModule.User;
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
