import { getByGoogleId } from "./controller";
import { UserModule } from "./generated-types/module-types";

const resolvers: UserModule.Resolvers = {
    Query: {
        User(_parent, args: { google_id: string }) {
            return getByGoogleId(args.google_id);
        },
    },
};

export default resolvers;
