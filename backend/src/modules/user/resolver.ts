import {
    getUserByEmail,
    updateUserInfo,
    updateUserMajor,
    updateUserEmailPreferences
} from "./controller";
import { UserModule } from "./generated-types/module-types";
import { secure } from "../../utils/secure";

const resolvers: UserModule.Resolvers = {
    Query: {
        // must be logged in to query for user, but can query for any user
        User: secure((_parent: any, args: { email: string }) => {
            return getUserByEmail(args.email);
        }),
    },
    Mutation: {
        UpdateUserInfo: secure(async (
            _parent: any,
            args: {
                username: string,
                first_name: string,
                last_name: string,
            },
            contextValue: any,
        ) => {
            await updateUserInfo(contextValue.user.email, args.username, args.first_name, args.last_name);
            return getUserByEmail(contextValue.user.email);
        }),

        UpdateUserMajor: secure(async (
            _parent: any,
            args: {
                major: string[],
            },
            contextValue: any,
        ) => {
            await updateUserMajor(contextValue.user.email, args.major);
            return getUserByEmail(contextValue.user.email);
        }),

        UpdateUserEmailPreferences: secure(async (
            _parent: any,
            args: {
                email_class_update: boolean,
                email_grade_update: boolean,
                email_enrollment_opening: boolean,
                email_berkeleytime_update: boolean,
            },
            contextValue: any,
        ) => {
            await updateUserEmailPreferences(
                contextValue.user.email,
                args.email_class_update,
                args.email_grade_update,
                args.email_enrollment_opening,
                args.email_berkeleytime_update
            )
            return getUserByEmail(contextValue.user.email);
        }),
    }
};

export default resolvers;
