import { users } from "./controller";
import { UserModule } from "./generated-types/module-types";

const resolvers: UserModule.Resolvers = {
  Query: {
    users,
  },
};

export default resolvers;
