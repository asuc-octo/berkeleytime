import { getTerm, getTerms } from "./controller";
import { TermModule } from "./generated-types/module-types";

const resolvers: TermModule.Resolvers = {
  Query: {
    terms: () => getTerms(),
    term: (_, { year, semester }) => getTerm(year, semester),
  },
};

export default resolvers;
