import { getCombinedGrades } from "./controller";
import { GradeModule } from "./generated-types/module-types";

const resolvers: GradeModule.Resolvers = {
  Query: {
    grade: (_, { subject, courseNum, classNum, term }) => {
      return getCombinedGrades(subject, courseNum, classNum, term)
    }
  },
};

export default resolvers;
