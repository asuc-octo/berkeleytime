import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const staffMemberSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    personalLink: {
      type: String,
      trim: true,
      required: false,
    },
    isAlumni: {
      type: Boolean,
      required: true,
      default: false,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
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

staffMemberSchema.index({ userId: 1 });

export const StaffMemberModel = mongoose.model(
  "staff-members",
  staffMemberSchema
);

export type StaffMemberType = Document &
  InferSchemaType<typeof staffMemberSchema>;
