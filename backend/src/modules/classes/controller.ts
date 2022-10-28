import { ObjectId } from "mongodb";
import { Enrollment } from "../../generated-types/graphql";
import { enrollment } from "./fixture";
import { ClassesModule } from "./generated-types/module-types";
import { SisClassHistoryModel, SisClassHistory, SisClassModel } from "./model";

// FIXME: sus typescript
export async function getEnrollment(): Promise<Enrollment[]> {
  const sisClass = await SisClassModel.findOne({
    _id: new ObjectId("6241667392d241cfa432897d"),
  }).exec();
  //   console.log(res);
  const classHistory = await SisClassHistoryModel.find({
    collectionId: new ObjectId("6241667392d241cfa432897d"),
  }).sort({ createdAt: 1 });
  //   console.log(res);
  const enrollmentInfo = classHistory
    .map((r) => {
      return {
        date: r.createdAt!,
        enrolledCount: r.diff?.aggregateEnrollmentStatus
          ?.enrolledCount[1] as number,
      };
    })
    .filter((r) => r?.enrolledCount !== undefined);

  return [
    {
      classId: sisClass?.course?.catalogNumber?.number!,
      enrollmentInfo,
    },
  ];
}

// MATH54: ObjectId("6241667392d241cfa432897d")
export async function getEnrollmentByClassId(
  classId: string
): Promise<ClassesModule.Enrollment> {
  const sisClass = await SisClassModel.findOne({
    _id: new ObjectId(classId),
  }).exec();
  //   console.log(res);
  const classHistory = await SisClassHistoryModel.find({
    collectionId: new ObjectId(classId),
  }).sort({ createdAt: 1 });
  //   console.log(res);
  const enrollmentInfo = classHistory
    .map((r) => {
      return {
        date: r.createdAt!,
        enrolledCount: r.diff?.aggregateEnrollmentStatus
          ?.enrolledCount[1] as number,
      };
    })
    .filter((r) => r?.enrolledCount !== undefined);

  return {
    classId: sisClass?.course?.catalogNumber?.number!,
    enrollmentInfo,
  };
}
