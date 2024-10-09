import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const userSchema = new Schema(
  {
    google_id: {
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

export const UserModel = mongoose.model("user", userSchema);

export type UserType = Document & InferSchemaType<typeof userSchema>;
