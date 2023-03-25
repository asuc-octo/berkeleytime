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
            const res = deleteUser(contextValue.user._id);

            contextValue.user.logout((err: Error) => {
                if (err) {
                    throw err;
                }
            });

            return res;
        },
    }
};

export default resolvers;
