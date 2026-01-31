import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

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
    highMetrics: {
      type: Boolean,
      required: true,
      default: false,
    },
    dismissCount: {
      type: Number,
      required: true,
      default: 0,
    },
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
