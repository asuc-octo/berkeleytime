import { grades } from "./controller";
import { GradeModule } from "./generated-types/module-types";

const resolvers: GradeModule.Resolvers = {
  Query: {
    grades(_parent, args: { CourseControlNumber: number, Year: number, Semester: string }) {
      return grades(args.CourseControlNumber, args.Year, args.Semester);
    },
  },
};

export default resolvers;
