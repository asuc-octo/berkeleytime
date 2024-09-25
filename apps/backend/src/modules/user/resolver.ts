import { deleteUser, getUserById, updateUserInfo } from "./controller";
import { UserModule } from "./generated-types/module-types";

const resolvers: UserModule.Resolvers = {
  Query: {
    user(_, __, contextValue) {
      return getUserById(contextValue.user._id);
    },
  },
  Mutation: {
    updateUserInfo(_, args, contextValue) {
      return updateUserInfo(contextValue.user._id, args.newUserInfo);
    },

    deleteUser(_, __, contextValue) {
      const res = deleteUser(contextValue.user._id);

      contextValue.user.logout((err: Error) => {
        if (err) {
          throw err;
        }
      });

      return res;
    },
  },
};

export default resolvers;
