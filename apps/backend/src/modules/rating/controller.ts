import { RatingModel, RatingType } from '@repo/common';
import {
  CreateRatingInput,
  DeleteRatingInput,
  Mutation,
  Query,
  Rating,
  RatingSummary,
  UpdateRatingInput,
} from "../../generated-types/graphql";

export const getRating = async (name: string, subject: string, number: string) => {
  if (!context.user._id) throw new Error("Unauthorized"); 

  const rating = mongoose.model("schedule", scheduleSchema)
  return null;
}

export const getUserRatings = async () => {

}

export const createRating = async (context: any, input: CreateRatingInput) => {
  if (!context.user._id) throw new Error("Unauthorized");
  if (input.value < 1 || input.value > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
  
};
// export const getSchedule = async (context: any, id: string) => {
//   const schedule = await ScheduleModel.findOne({
//     _id: id,
//     $or: [{ public: true }, { createdBy: context.user._id }],
//   });

//   if (!schedule) throw new Error("Not found");

//   return await formatSchedule(schedule);
// };

// export const createSchedule = async (
//   context: any,
//   input: CreateScheduleInput
// ) => {
//   if (!context.user._id) throw new Error("Unauthorized");

//   const term = await TermModel.findOne({
//     name: `${input.year} ${input.semester}`,
//   });

//   if (!term) throw new Error("Invalid term");

//   const schedule = await ScheduleModel.create({
//     ...input,
//     createdBy: context.user._id,
//   });

//   return await formatSchedule(schedule);
// };
