import { getStats } from "./controller";
import { StatsModule } from "./generated-types/module-types";

const resolvers: StatsModule.Resolvers = {
  Query: {
    stats: () => getStats(),
  },
};

export default resolvers;
