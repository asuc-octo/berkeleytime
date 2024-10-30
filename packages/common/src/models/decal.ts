import mongoose, { InferSchemaType, Schema } from "mongoose";

import { schemaOptions } from "../lib/common";

const decalSection = {
    title: String,
    faciliators: String,
    size: Number,
    location: String,
    time: String,
    starts: String,
    status: String,
    ccn: Number,
}

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
        type: Number,
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
    sections: [decalSection],
    enroll: String,
    contact: String,
    course: String,
    semester: String,
}


export const decalSchema = new Schema(decalSchemaObject, schemaOptions);
export const decalModel = mongoose.model("Decal", decalSchema, "decal");
export type decalType = InferSchemaType<typeof decalSchema>;
