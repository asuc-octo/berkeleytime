import mongoose, { Document, InferSchemaType, Schema } from "mongoose";

export const navItemSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    badgeText: {
      type: String,
      required: false,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    visible: {
      type: Boolean,
      required: true,
      default: true,
    },
    clickCount: {
      type: Number,
      required: true,
      default: 0,
    },
    clickEventLogging: {
      type: Boolean,
      required: true,
      default: false,
    },
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

export const NavItemModel = mongoose.model("navItems", navItemSchema);

export type NavItemType = Document & InferSchemaType<typeof navItemSchema>;
