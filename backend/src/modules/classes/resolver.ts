import { getEnrollmentByClassId } from "./controller";
import { ClassesModule } from "./generated-types/module-types";

const resolvers: ClassesModule.Resolvers = {
  Query: {
    Enrollment(_parent, args: { classId: string }) {
      return getEnrollmentByClassId(args.classId);
    },
  },
};

export default resolvers;
