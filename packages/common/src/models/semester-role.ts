import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const semesterRoleSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "staff-members",
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    semester: {
      type: String,
      enum: ["Spring", "Summer", "Fall", "Winter"],
      required: true,
    },
    role: {
      type: String,
      trim: true,
      required: true,
    },
    team: {
      type: String,
      trim: true,
      required: false,
    },
    photo: {
      type: String,
      required: false,
    },
    altPhoto: {
      type: String,
      required: false,
    },
    isLeadership: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

semesterRoleSchema.index({ year: 1, semester: 1 });
semesterRoleSchema.index({ memberId: 1 });
semesterRoleSchema.index(
  { memberId: 1, year: 1, semester: 1 },
  { unique: true }
);

export const SemesterRoleModel = mongoose.model(
  "semester-roles",
  semesterRoleSchema
);

export type SemesterRoleType = Document &
  InferSchemaType<typeof semesterRoleSchema>;
