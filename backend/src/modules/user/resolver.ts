import {
    getUserById,
    updateUserInfo,
    deleteUser,
} from "./controller";
import { UserModule } from "./generated-types/module-types";

const resolvers: UserModule.Resolvers = {
    Query: {
        User(_, __, contextValue) {
            return getUserById(contextValue.user._id);
        },
    },
    Mutation: {
        UpdateUserInfo(_, args, contextValue) {
            return updateUserInfo(contextValue.user._id, args.newUserInfo);
        },

        DeleteUser(_, __, contextValue) {
            return deleteUser(contextValue.user._id);
        },
    }
};

export default resolvers;
