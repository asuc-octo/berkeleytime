import {
  AggregatedMetricsModel,
  CollectionModel,
  RatingModel,
  ScheduleModel,
  UserModel,
} from "@repo/common/models";

import { UpdateUserInput } from "../../generated-types/graphql";
import { RequestContext } from "../../types/request-context";
import { formatUser } from "./formatter";

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

  const existingUser = await UserModel.findById(userId);
  if (!existingUser) throw new Error("Not found");

  const { monitoredClasses, ...rest } = user;
  const update: Record<string, unknown> = { ...rest };

  if (monitoredClasses != null) {
    update.monitoredClasses = monitoredClasses.map((mc) => {
      const existing = existingUser.monitoredClasses?.find(
        (e) =>
          e.class?.year === mc.class.year &&
          e.class?.semester === mc.class.semester &&
          e.class?.subject === mc.class.subject &&
          e.class?.courseNumber === mc.class.courseNumber &&
          e.class?.number === mc.class.number
      );
      return {
        class: mc.class,
        notified: existing?.notified ?? false,
      };
    });
  }

  const updatedUser = await UserModel.findByIdAndUpdate(userId, update, {
    new: true,
  });

  if (!updatedUser) throw new Error("Invalid");

  return formatUser(updatedUser);
};

export const deleteAccount = async (context: RequestContext) => {
  if (!context.user?._id) throw new Error("Unauthorized");
  const userId = context.user._id;

  // Delete all collections
  await CollectionModel.deleteMany({ createdBy: userId });

  // Delete all schedules
  await ScheduleModel.deleteMany({ createdBy: userId });

  // Find all ratings for this user
  const userRatings = await RatingModel.find({ createdBy: userId });

  // Update aggregated metrics for each rating before deletion
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

  // Delete all ratings
  await RatingModel.deleteMany({ createdBy: userId });

  // Delete the user record
  await UserModel.findByIdAndDelete(userId);

  return true;
};
