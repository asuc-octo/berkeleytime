import {
  AggregatedMetricsModel,
  CollectionModel,
  EnrollmentSubscriptionModel,
  RatingModel,
  ScheduleModel,
  UserModel,
} from "@repo/common/models";

import { RequestContext } from "../../types/request-context";
import { formatUser } from "./formatter";

interface MonitoredClassRefInput {
  year: number;
  semester: string;
  sessionId?: string | null;
  subject: string;
  courseNumber: string;
  number: string;
}

interface MonitoredClassInput {
  class: MonitoredClassRefInput;
  thresholds: number[];
}

interface UpdateUserInput {
  majors?: string[] | null;
  minors?: string[] | null;
  monitoredClasses?: MonitoredClassInput[] | null;
  notificationsOn?: boolean | null;
}

export const getUser = async (context: RequestContext) => {
  if (!context.user?._id) throw new Error("Unauthorized");
  const userId = context.user._id;

  const user = await UserModel.findById(userId);

  if (!user) throw new Error("Not found");

  return formatUser(user);
};

export const updateUser = async (
  context: RequestContext,
  user: UpdateUserInput
) => {
  if (!context.user?._id) throw new Error("Unauthorized");
  const userId = context.user._id;

  const { monitoredClasses, ...userFields } = user;

  if (monitoredClasses != null) {
    await EnrollmentSubscriptionModel.deleteMany({ userId });

    if (monitoredClasses.length > 0) {
      const deduped = new Map<
        string,
        {
          userId: string;
          year: number;
          semester: string;
          sessionId: string;
          subject: string;
          courseNumber: string;
          sectionNumber: string;
          thresholds: number[];
        }
      >();

      for (const mc of monitoredClasses) {
        const c = mc.class;
        const key = `${c.year}-${c.semester}-${c.sessionId ?? "1"}-${c.subject}-${c.courseNumber}-${c.number}`;
        const existing = deduped.get(key);
        const thresholds = new Set<number>(existing?.thresholds ?? []);
        (mc.thresholds ?? []).forEach((t) => thresholds.add(t));

        deduped.set(key, {
          userId,
          year: c.year,
          semester: c.semester,
          sessionId: c.sessionId ?? "1",
          subject: c.subject,
          courseNumber: c.courseNumber,
          sectionNumber: c.number,
          thresholds: Array.from(thresholds),
        });
      }

      await EnrollmentSubscriptionModel.insertMany(
        Array.from(deduped.values()),
        { ordered: false }
      );
    }
  }

  const updatedUser = await UserModel.findByIdAndUpdate(userId, userFields, {
    new: true,
  });

  if (!updatedUser) throw new Error("Invalid");

  return formatUser(updatedUser);
};

export const getMonitoredClasses = async (userId: string) => {
  const subscriptions = await EnrollmentSubscriptionModel.find({
    userId,
  }).lean();

  return subscriptions.map((sub) => ({
    class: {
      year: sub.year,
      semester: sub.semester,
      sessionId: sub.sessionId ?? "1",
      subject: sub.subject,
      courseNumber: sub.courseNumber,
      number: sub.sectionNumber,
    },
    thresholds: sub.thresholds,
  }));
};

export const deleteAccount = async (context: RequestContext) => {
  if (!context.user?._id) throw new Error("Unauthorized");
  const userId = context.user._id;

  await CollectionModel.deleteMany({ createdBy: userId });
  await ScheduleModel.deleteMany({ createdBy: userId });
  await EnrollmentSubscriptionModel.deleteMany({ userId });

  const userRatings = await RatingModel.find({ createdBy: userId });

  for (const rating of userRatings) {
    await AggregatedMetricsModel.findOneAndUpdate(
      {
        classId: rating.classId,
        metricName: rating.metricName,
        categoryValue: rating.value,
      },
      { $inc: { categoryCount: -1 } }
    );
  }

  await RatingModel.deleteMany({ createdBy: userId });
  await UserModel.findByIdAndDelete(userId);

  return true;
};
