import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

export const GradeSchema = new Schema({
    _id: { type: Types.ObjectId, required: true },
    _created: String,
    _updated: String,
    _version: Number,
    term: {
        year: Number,
        month: Number,
        semester: String,
    },
    CourseControlNbr: Number,
    CourseNbr: String,
    CourseSubjectShortNm: String,
    CourseTitleNm: String,
    EnrollmentCnt: Number,
    GradeNm: String,
    GradeSortNbr: String,
    GradeSubtypeDesc: String,
    GradeTypeDesc: String,
    InstructorName: [String],
    SectionNbr: Number
});

export const GradeModel = mongoose.model("calanswers_grade", GradeSchema, "calanswers_grade");
export type GradeType = InferSchemaType<typeof GradeSchema>;
