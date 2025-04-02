import mongoose, { InferSchemaType, Schema } from "mongoose";

import { schemaOptions } from "../lib/common";

export interface IDecal {
  // identifiers
  semester: string;
  year: string;
  courseNumber: string;
  subject: string;
  number: string;
  termId: string;
  externalId: string;

  // attributes
  category: string | null;
  units: string | null;
  date: string | null;
  title?: string;
  description?: string;
  website?: string;
  application?: string;
  enroll?: string;
  contact?: string;
}

const decalSchemaObject = {
  semester: { type: String, required: true },
  year: { type: String, required: true },
  courseNumber: { type: String, required: true },
  subject: { type: String, required: true },
  number: { type: String, required: true },
  termId: { type: String, required: true },
  externalId: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  units: {
    type: String,
  },
  date: {
    type: String,
  },
  title: { type: String },
  description: { type: String },
  website: { type: String },
  application: { type: String },
  enroll: { type: String },
  contact: { type: String },
};

// TODO: Index

export const decalSchema = new Schema(decalSchemaObject, schemaOptions);
export const DecalModel = mongoose.model("Decal", decalSchema);
export type DecalType = InferSchemaType<typeof decalSchema>;
