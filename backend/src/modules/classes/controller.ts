import { ClassesModule } from "./generated-types/module-types";
import { SisClassHistoryModel, SisClassModel } from "./model";
import { constructEnrollment } from "./utils";

// MATH54: ObjectId("6241667392d241cfa432897d")
export async function getEnrollmentByClassId(
  classId: string
): Promise<ClassesModule.Enrollment> {
  const sisClass = await SisClassModel.findOne({
    "course.identifiers.id": classId,
  }).exec();

  const sisClassHistory = await SisClassHistoryModel.find({
    collectionId: sisClass?._id,
  }).sort({ createdAt: 1 });

  const enrollmentInfo = constructEnrollment(sisClassHistory);

  if (!sisClass?.course?.identifiers?.[0].id) {
    throw new Error("Invalid classId");
  }

  return {
    classId: sisClass?.course?.identifiers?.[0].id,
    enrollmentInfo,
  };
}
