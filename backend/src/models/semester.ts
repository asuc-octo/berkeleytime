import { schemaOptions } from './common';
import mongoose, { Schema, InferSchemaType } from 'mongoose';

const semesterSchemaObject = {
    term: { type: String, enum: ['Fall', 'Spring', 'Summer', 'Winter'], required: true },
    year: { type: Number, required: true },
    active: { type: Boolean, required: true },
    // TODO: add other semester-specific info
}

const semesterSchema = new Schema(semesterSchemaObject, schemaOptions);
export const SemesterModel = mongoose.model('Semester', semesterSchema);
export type SemesterType = InferSchemaType<typeof semesterSchema>