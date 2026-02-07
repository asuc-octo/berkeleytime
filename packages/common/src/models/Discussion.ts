import mongoose, { InferSchemaType, Schema } from "mongoose";

const commentSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    body: {
      type: String,
      trim: true,
      required: true,
    },
    authorId: {
      type: String,
      trim: true,
      required: true,
      immutable: true,
    },
    authorName: {
      type: String,
      trim: true,
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "class",
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    courseNumber: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    classNumber: {
      type: String,
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "comment",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Comments for a class
commentSchema.index({
  subject: 1,
  courseNumber: 1,
  semester: 1,
  year: 1,
  classNumber: 1,
});

// Replies by parent
commentSchema.index({ parentId: 1 });

export const CommentModel = mongoose.model("comment", commentSchema);
export type CommentType = InferSchemaType<typeof commentSchema>;
