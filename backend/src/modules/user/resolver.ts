import { getById } from "./controller";
import { UserModule } from "./generated-types/module-types";

const resolvers: UserModule.Resolvers = {
    Query: {
        User(_parent, args: { id: string }) {
            return getById(args.id);
        },
    },
};

export default resolvers;
