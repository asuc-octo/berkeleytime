import mongoose from "mongoose";

const DiscussionSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const DiscussionModel =
  mongoose.models.Discussion ||
  mongoose.model("Discussion", DiscussionSchema);
