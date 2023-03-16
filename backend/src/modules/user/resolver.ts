import { changeFirstName, getByEmail } from "./controller";
import { UserModule } from "./generated-types/module-types";

const resolvers: UserModule.Resolvers = {
    Query: {
        User(_parent: any, args: { email: string }) {
            return getByEmail(args.email);
        },
    },
    Mutation: {
        // for testing
        UserChangeFirstName(_parent: any, args: { first_name: string }, contextValue: any) {
            changeFirstName(contextValue.user.email, args.first_name);
            return getByEmail(contextValue.user.email);
        }
    },
};

export default resolvers;
