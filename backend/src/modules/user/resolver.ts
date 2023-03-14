import { getByEmail } from "./controller";
import { UserModule } from "./generated-types/module-types";
import { secure } from "../../utils/secure";

const resolvers: UserModule.Resolvers = {
    Query: {
        User: secure((_parent: any, args: { email: string }) => {
            return getByEmail(args.email);
        }),
    },
};

export default resolvers;
