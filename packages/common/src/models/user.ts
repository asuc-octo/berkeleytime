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
    minors: {
      type: [String],
      trim: true,
      required: false,
    },
    lastSeenAt: {
      type: Date,
      required: true,
      default: new Date(0), // Unix epoch (1970-01-01) indicates legacy user who hasn't visited since tracking started
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
