import mongoose, { InferSchemaType, Schema } from "mongoose";

import { schemaOptions } from "../lib/common";

const decalSchemaObject = {
  id: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  units: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  title: String,
  description: String,
  website: String,
  application: String,
  enroll: String,
  contact: String,

  semester: String,
  year: String,
  courseNumber: String,
  subject: String,
};

export const decalSchema = new Schema(decalSchemaObject, schemaOptions);
export const DecalModel = mongoose.model("Decal", decalSchema, "decal");
export type DecalType = InferSchemaType<typeof decalSchema>;
