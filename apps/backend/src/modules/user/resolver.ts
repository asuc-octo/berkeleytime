import { getUser } from "./controller";
import { UserModule } from "./generated-types/module-types";

const resolvers: UserModule.Resolvers = {
  Query: {
    user(_, __, context) {
      return getUser(context);
    },
  },
};

export default resolvers;
