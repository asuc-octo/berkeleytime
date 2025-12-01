import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

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
          personalNote: {
            type: {
              text: {
                type: String,
                required: true,
              },
              updatedAt: {
                type: Date,
                required: true,
              },
            },
            required: false,
            default: undefined,
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
