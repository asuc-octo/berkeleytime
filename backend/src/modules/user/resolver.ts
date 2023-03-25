import {
    getUserByEmail,
    updateUserInfo,
    deleteUser,
} from "./controller";
import { UserModule } from "./generated-types/module-types";

const resolvers: UserModule.Resolvers = {
    Query: {
        // must be logged in to query for user, but can query for any user
        User(_, __, contextValue) {
            return getUserByEmail(contextValue.user.email);
        },
    },
    Mutation: {
        UpdateUserInfo: async (_, args, contextValue) => {
            await updateUserInfo(contextValue.user.email, args);
            return getUserByEmail(contextValue.user.email);
        },

        DeleteUser: async (_, __, contextValue) => {
            const user = getUserByEmail(contextValue.user.email);
            await deleteUser(contextValue.user.email);
            return user;
        },
    }
};

export default resolvers;
