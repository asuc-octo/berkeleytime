import mongoose, { Document, InferSchemaType, Schema } from "mongoose";
import { SEMESTER_ENUM } from "../lib/common";

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
    staff: {
      type: Boolean,
      required: true,
      default: false,
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
            enum: SEMESTER_ENUM,
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
    notificationsOn: {
      type: Boolean,
      required: true,
      default: false,
    },
    lastNotified: {
      type: Date,
      required: false,
    },
    minors: {
      type: [String],
      trim: true,
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

// for login
userSchema.index({ email: 1 }, { unique: true });

export const UserModel = mongoose.model("users", userSchema);

export type UserType = Document & InferSchemaType<typeof userSchema>;
