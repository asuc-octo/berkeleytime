import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

// Subdocument schema for snapshot (embedded, no _id)
// Captures the state of all editable banner fields at a point in time
const bannerSnapshotSchema = new Schema(
  {
    text: String,
    link: String,
    linkText: String,
    persistent: Boolean,
    reappearing: Boolean,
    clickEventLogging: Boolean,
    visible: Boolean,
  },
  { _id: false }
);

// Subdocument schema for version entry (embedded in banner)
// Each edit creates a new version entry with the changed fields and a full snapshot
const bannerVersionEntrySchema = new Schema(
  {
    version: { type: Number, required: true },
    changedFields: [String], // e.g., ['text', 'persistent'] - what changed in this edit
    timestamp: { type: Date, required: true },
    snapshot: bannerSnapshotSchema,
    metadata: Schema.Types.Mixed, // For future extensibility (rollback info, audit trail, etc.)
  },
  { _id: false }
);

export const bannerSchema = new Schema(
  {
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
    persistent: {
      type: Boolean,
      required: true,
      default: false,
    },
    reappearing: {
      type: Boolean,
      required: true,
      default: false,
    },
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
    visible: {
      type: Boolean,
      required: true,
      default: true,
    },
    // Version control fields - embedded array for atomic updates and automatic cleanup on delete
    currentVersion: {
      type: Number,
      default: 1,
    },
    versionHistory: [bannerVersionEntrySchema],
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export const BannerModel = mongoose.model("banners", bannerSchema);

export type BannerType = Document & InferSchemaType<typeof bannerSchema>;

// Export snapshot type for use in version service
export type BannerSnapshot = InferSchemaType<typeof bannerSnapshotSchema>;
export type BannerVersionEntry = InferSchemaType<
  typeof bannerVersionEntrySchema
>;
