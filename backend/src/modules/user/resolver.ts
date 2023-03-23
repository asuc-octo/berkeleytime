import {
    getUserByEmail,
    updateUserInfo,
    updateUserMajor,
    updateUserEmailPreferences,
    deleteUser
} from "./controller";
import { UserModule } from "./generated-types/module-types";

const resolvers: UserModule.Resolvers = {
    Query: {
        // must be logged in to query for user, but can query for any user
        User(_parent, _, contextValue) {
            return getUserByEmail(contextValue.user.email);
        },
    },
    Mutation: {
        UpdateUserInfo: async (_parent, args, contextValue) => {
            await updateUserInfo(
                contextValue.user.email,
                args.username ?? undefined,
                args.first_name ?? undefined,
                args.last_name ?? undefined,
            );
            return getUserByEmail(contextValue.user.email);
        },

        UpdateUserMajor: async (_parent, args, contextValue) => {
            await updateUserMajor(contextValue.user.email, args.major ?? undefined);
            return getUserByEmail(contextValue.user.email);
        },

        UpdateUserEmailPreferences: async (_parent,args,contextValue,) => {
            await updateUserEmailPreferences(
                contextValue.user.email,
                args.email_class_update ?? undefined,
                args.email_grade_update ?? undefined,
                args.email_enrollment_opening ?? undefined,
                args.email_berkeleytime_update ?? undefined,
            );
            return getUserByEmail(contextValue.user.email);
        },

        DeleteUser: async (_parent, _args, contextValue) => {
            const user = getUserByEmail(contextValue.user.email);
            await deleteUser(contextValue.user.email);
            return user;
        },
    }
};

export default resolvers;
