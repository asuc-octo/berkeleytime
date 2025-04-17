import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const userSchema = new Schema(
  {
    googleId: {
      type: String,
      trim: true,
      required: true,
      immutable: true,
      select: false,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      immutable: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    majors: {
      type: [String],
      required: false,
      default: [],
    },
    bookmarkedClasses: {
      required: false,
      default: [],
      type: [
        {
          year: {
            type: Number,
            required: true,
          },
          semester: {
            type: String,
            enum: ["Spring", "Summer", "Fall", "Winter"],
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
          number: {
            type: String,
            required: true,
          },
        },
      ],
    },
    bookmarkedCourses: {
      required: false,
      default: [],
      type: [
        {
          subject: {
            type: String,
            required: true,
          },
          number: {
            type: String,
            required: true,
          },
        },
      ],
    },
    refresh_token: {
      type: String,
      trim: true,
      required: false,
      select: false,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export const UserModel = mongoose.model("users", userSchema);

export type UserType = Document & InferSchemaType<typeof userSchema>;
