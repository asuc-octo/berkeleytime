import mongoose, { InferSchemaType, Schema } from "mongoose";

export const enrollmentSchema = new Schema({
    classIdentifier: {
        type: {
            year: Number,
            semester: String,
            subject: String,
            courseNumber: String,
            classNumber: String
        },
        required: true
    },
    enrollmentDays: [{
        date: String,
        enrollCount: Number,
        enrollMax: Number,
        waitlistCount: Number,
        waitlistMax: Number,
    }]
});

export const EnrollmentModel = mongoose.model("enrollment", enrollmentSchema);
export type EnrollmentType = InferSchemaType<typeof enrollmentSchema>;
