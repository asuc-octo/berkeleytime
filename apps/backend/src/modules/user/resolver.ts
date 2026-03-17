import {
  deleteAccount,
  getUser,
  recalculateActivityScores,
  updateUser,
} from "./controller";
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
    deleteAccount: async (_, __, context) => {
      return await deleteAccount(context);
    },
    recalculateActivityScores: async (_, __, context) => {
      return await recalculateActivityScores(context);
    },
  },
};

export default resolvers;
