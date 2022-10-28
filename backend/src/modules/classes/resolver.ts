import { getEnrollmentByClassId, getEnrollment } from "./controller";
import { ClassesModule } from "./generated-types/module-types";

const resolvers: ClassesModule.Resolvers = {
  Query: {
    Enrollment: getEnrollment,
    EnrollmentById(parent, args: { classId: string }, context, info) {
      return getEnrollmentByClassId(args.classId);
    },
  },
};

export default resolvers;
