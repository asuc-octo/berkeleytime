import { getDecalsByYearSemester } from "./controller";
import { DecalModule } from "./generated-types/module-types";

const resolvers: DecalModule.Resolvers = {
  Query: {
    decals: async (_, args: { semester: string; year: string }) => {
      const { semester, year } = args;
      return await getDecalsByYearSemester(semester, year);
    },
  },
};

export default resolvers;
