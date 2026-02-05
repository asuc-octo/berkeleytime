import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

// Subdocument: a single targeted course (embedded, no _id)
const targetedMessageCourseSchema = new Schema(
  {
    courseId: { type: String, required: true },
    subject: { type: String, required: true },
    courseNumber: { type: String, required: true },
  },
  { _id: false }
);

// Subdocument: snapshot of all editable fields at a point in time (embedded, no _id)
// Used in version history to capture the full state after each edit
const targetedMessageSnapshotSchema = new Schema(
  {
    text: String,
    link: String,
    linkText: String,
    visible: Boolean,
    clickEventLogging: Boolean,
    targetCourses: [targetedMessageCourseSchema],
  },
  { _id: false }
);

// Subdocument: a single version history entry (embedded, no _id)
// Each edit creates a new entry with the changed fields and a full snapshot
const targetedMessageVersionEntrySchema = new Schema(
  {
    version: { type: Number, required: true },
    changedFields: [String],
    timestamp: { type: Date, required: true },
    snapshot: targetedMessageSnapshotSchema,
    metadata: Schema.Types.Mixed,
  },
  { _id: false }
);

export const targetedMessageSchema = new Schema(
  {
    // Content
    text: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: false,
      trim: true,
    },
    linkText: {
      type: String,
      required: false,
      trim: true,
    },

    // Visibility
    visible: {
      type: Boolean,
      required: true,
      default: true,
    },

    // Targeting
    targetCourses: {
      type: [targetedMessageCourseSchema],
      required: true,
      default: [],
    },

    // Analytics
    clickCount: {
      type: Number,
      required: true,
      default: 0,
    },
    dismissCount: {
      type: Number,
      required: true,
      default: 0,
    },
    clickEventLogging: {
      type: Boolean,
      required: true,
      default: false,
    },

    // Version control
    currentVersion: {
      type: Number,
      default: 1,
    },
    versionHistory: [targetedMessageVersionEntrySchema],
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

// Index for efficient lookup by targeted courseId
targetedMessageSchema.index({ "targetCourses.courseId": 1 });

export const TargetedMessageModel = mongoose.model(
  "targetedmessages",
  targetedMessageSchema
);

export type TargetedMessageType = Document &
  InferSchemaType<typeof targetedMessageSchema>;

export type TargetedMessageSnapshot = InferSchemaType<
  typeof targetedMessageSnapshotSchema
>;

export type TargetedMessageVersionEntry = InferSchemaType<
  typeof targetedMessageVersionEntrySchema
>;

export type TargetedMessageCourse = InferSchemaType<
  typeof targetedMessageCourseSchema
>;
