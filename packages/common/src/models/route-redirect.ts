import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const routeRedirectSchema = new Schema(
  {
    fromPath: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    toPath: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);

export const RouteRedirectModel = mongoose.model(
  "routeRedirects",
  routeRedirectSchema
);

export type RouteRedirectType = Document &
  InferSchemaType<typeof routeRedirectSchema>;
