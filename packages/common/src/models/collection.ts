import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const COLLECTION_COLORS = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

export type CollectionColor = (typeof COLLECTION_COLORS)[number];

export const collectionSchema = new Schema(
  {
    createdBy: {
      type: String,
      trim: true,
      required: true,
      immutable: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      enum: COLLECTION_COLORS,
      required: false,
      default: undefined,
    },
    pinnedAt: {
      type: Date,
      required: false,
      default: undefined,
    },
    isSystem: {
      type: Boolean,
      required: true,
      default: false,
    },
    classes: {
      required: true,
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
          sessionId: {
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
          classNumber: {
            type: String,
            required: true,
          },
          addedAt: {
            type: Date,
            required: true,
            default: Date.now,
          },
        },
      ],
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
collectionSchema.index({ createdBy: 1, name: 1 }, { unique: true });

export const CollectionModel = mongoose.model("collections", collectionSchema);

export type CollectionType = Document &
  InferSchemaType<typeof collectionSchema>;
