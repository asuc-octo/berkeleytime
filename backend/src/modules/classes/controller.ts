import { ObjectId } from "mongodb";
import { ClassesModule } from "./generated-types/module-types";
import { SisClassHistoryModel, SisClassModel } from "./model";
import { constructEnrollment } from "./utils";

// MATH54: ObjectId("6241667392d241cfa432897d")
export async function getEnrollmentByClassId(
  classId: string
): Promise<ClassesModule.Enrollment> {
  const sisClass = await SisClassModel.findOne({
    _id: new ObjectId(classId),
  }).exec();

  const sisClassHistory = await SisClassHistoryModel.find({
    collectionId: new ObjectId(classId),
  }).sort({ createdAt: 1 });

  const enrollmentInfo = constructEnrollment(sisClassHistory);

  return {
    classId: sisClass?.course?.catalogNumber?.number as string,
    enrollmentInfo,
  };
}
