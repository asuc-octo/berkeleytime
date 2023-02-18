import { getByEmail } from "./controller";
import { UserModule } from "./generated-types/module-types";

const resolvers: UserModule.Resolvers = {
    Query: {
        User(_parent, args: { email: string }) {
            return getByEmail(args.email);
        },
    },
};

export default resolvers;
