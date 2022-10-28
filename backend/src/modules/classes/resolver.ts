import { getEnrollmentByClassId, getEnrollment } from "./controller";
import { ClassesModule } from "./generated-types/module-types";

const resolvers: ClassesModule.Resolvers = {
  Query: {
    Enrollment: getEnrollment,
    EnrollmentById(_parent, args: { classId: string }) {
      return getEnrollmentByClassId(args.classId);
    },
  },
};

export default resolvers;
