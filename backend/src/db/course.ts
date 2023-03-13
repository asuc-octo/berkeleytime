import mongoose, { Schema, InferSchemaType } from "mongoose";
import { createHistorySchema } from "../utils/history";

const CourseSchemaObject = {
    _id: Schema.Types.ObjectId,
    _created: Date,
    _updated: Date,
    _version: Number,
    academicCareer: {
        code: String,
        description: String,
    },
    academicGroup: {
        code: String,
        description: String,
    },
    academicOrganization: {
        code: String,
        description: String,
    },
    allowMultipleEnrollments: Boolean,
    anyFeesExist: Boolean,
    blindGrading: Boolean,
    catalogNumber: {
        formatted: String,
        number: String,
        prefix: String,
        suffix: String,
    },
    cip: {
        code: String,
        description: String,
    },
    classDisplayName: String,
    classSubjectArea: {
        code: String,
        description: String,
    },
    contactHours: Number,
    courseObjectives: [String], // coverage: 1.4%
    createdDate: String,
    credit: {
        type: { type: String },
        value: {
            discrete: { // coverage: 1.7%
                units: [Number],
            },
            fixed: { // coverage: 82.9%
                units: Number,
            },
            range: { // coverage: 15.4%
                maxUnits: Number,
                minUnits: Number,
            },
        },
    },
    creditRestriction: { // coverage: 43.5%
        restrictionCourses: {
            creditRestrictionCourses: [{
                course: {
                    displayName: String,
                    identifiers: [{
                        id: String,
                        type: { type: String },
                    }],
                },
                maxCreditPercentage: Number, // coverage: 88.9%
            }],
        },
        restrictionText: String,
    },
    crossListing: { // coverage: 3.5%
        count: Number,
        courses: [String],
    },
    departmentNicknames: String,
    description: String,
    displayName: String,
    finalExam: {
        code: String, // coverage: 99.7%
        description: String, // coverage: 99.7%
    },
    formatsOffered: {
        description: String,
        formats: [{
            aggregateMaxContactHours: Number,
            aggregateMinContactHours: Number,
            anyFeesExist: Boolean,
            components: [{
                feesExist: Boolean,
                finalExam: {
                },
                instructionMethod: {
                    code: String,
                    description: String,
                },
                maxContactHours: Number,
                minContactHours: Number,
                primary: Boolean,
            }],
            description: String, // coverage: 99.2%
            maxWorkloadHours: Number,
            minWorkloadHours: Number,
            sessionType: String,
            termsAllowed: {
                termNames: [String],
            },
        }],
        summerOnly: Boolean,
        typicallyOffered: {
            comments: String,
            terms: {
                termNames: [String],
            },
        },
    },
    formerDisplayName: String,
    fromDate: String,
    gradeReplacement: { // coverage: 13.8%
        gradeReplacementCourses: [{ // coverage: 28.3%
            catalogNumber: {
            },
            displayName: String,
            identifiers: [{
                id: String,
                type: { type: String },
            }],
            subjectArea: {
            },
        }],
        gradeReplacementGroup: String, // coverage: 18.1%
        gradeReplacementText: String, // coverage: 73.9%
    },
    gradingBasis: {
        code: String,
        description: String,
    },
    hegis: {
        code: String,
        description: String,
    },
    identifiers: [{
        id: String,
        type: { type: String },
    }],
    instructorAddConsentRequired: Boolean, // coverage: 21.3%
    instructorDropConsentRequired: Boolean,
    multipleTermNumber: Number, // coverage: 91.3%
    preparation: {
        requiredCourses: {
            courses: [{ // coverage: 19.5%
                displayName: String,
                identifiers: [{
                    id: String,
                    type: { type: String },
                }],
            }],
        },
        requiredText: String, // coverage: 60.5%
    },
    primaryInstructionMethod: {
        code: String,
        description: String,
    },
    printInCatalog: Boolean,
    printInstructors: Boolean,
    proposedInstructors: [String],
    repeatability: {
        description: String, // coverage: 31.1%
        maxCount: Number, // coverage: 0.2%
        maxCredit: Number, // coverage: 0.9%
        repeatable: Boolean,
    },
    requirementsFulfilled: [{ // coverage: 3.6%
        code: String,
        description: String,
    }],
    spansMultipleTerms: Boolean, // coverage: 91.3%
    status: {
        code: String,
        description: String,
    },
    studentLearningOutcomes: [String], // coverage: 1.5%
    subjectArea: { // use classSubjectArea instead, since that is consistent with the other API data
        code: String,
        description: String,
    },
    tie: {
        code: String, // coverage: 47.3%
        description: String, // coverage: 47.3%
    },
    title: String,
    toDate: String,
    transcriptTitle: String,
    updatedDate: String,
    workloadHours: Number,
}

const CourseSchema = new Schema(CourseSchemaObject);

export const CourseModel = mongoose.model("sis_course", CourseSchema, "sis_course");
export type CourseType = InferSchemaType<typeof CourseSchema>;

const CourseHistorySchema = createHistorySchema(CourseSchemaObject, "sis_course");

export const CourseHistoryModel = mongoose.model("sis_course_history", CourseHistorySchema, "sis_course_history");
export type CourseHistoryType = InferSchemaType<typeof CourseHistorySchema>;