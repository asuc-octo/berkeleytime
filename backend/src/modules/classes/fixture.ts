import { ClassesModule } from "./generated-types/module-types";

export const enrollment: ClassesModule.Enrollment = {
  classId: "classId",
  enrollmentInfo: [
    {
      enrolledCount: 1,
      date: new Date().toISOString(),
    },
  ],
};
