import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const collectionSchema = new Schema(
  {
    ownerID: {
      type: String,
      trim: true,
      required: true,
      immutable: true,
    },
    viewerID: {
      type: [String],
      trim: true,
      required: false,
      default: [],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    classes: {
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
          comments: {
            type: [String],
            default: [],
            required: false,
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
collectionSchema.index({ ownerID: 1, name: 1 }, { unique: true });

export const CollectionModel = mongoose.model("collections", collectionSchema);

export type CollectionType = Document &
  InferSchemaType<typeof collectionSchema>;
