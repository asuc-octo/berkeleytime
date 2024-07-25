import { getTerms } from "./controller";
import { TermModule } from "./generated-types/module-types";

const resolvers: TermModule.Resolvers = {
  Query: {
    terms: () => getTerms(),
  },
};

export default resolvers;
