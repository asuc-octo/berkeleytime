import { grades } from "./controller";
import { GradeModule } from "./generated-types/module-types";

const resolvers: GradeModule.Resolvers = {
  Query: {
    grades,
  },
};

export default resolvers;
