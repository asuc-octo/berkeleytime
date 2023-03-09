import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const GradeSchema = new Schema({
    _id: Schema.Types.ObjectId,
    _created: Date,
    _updated: Date,
    _version: Number,
    CourseControlNbr: Number,
    CourseNumber: String,
    CourseSubjectShortNm: String,
    CourseTitleNm: String,
    EnrollmentCnt: Number,
    GradeNm: String,
    GradeSortNbr: String,
    GradeSubtypeDesc: String,
    GradeTypeDesc: String,
    InstructorName: [String],
    SectionNbr: String,
    term: {
        month: Number,
        semester: String,
        year: Number,
    },
})

export const GradeModel = mongoose.model("calanswers_grade", GradeSchema, "calanswers_grade");
export type GradeType = InferSchemaType<typeof GradeSchema>;
