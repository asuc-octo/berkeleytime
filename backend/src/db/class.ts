import mongoose, { Schema, InferSchemaType } from "mongoose";
import { createHistorySchema } from "../utils/history";

const ClassSchemaObject = {
    _id: Schema.Types.ObjectId,
    _created: Date,
    _updated: Date,
    _version: Number,
    aggregateEnrollmentStatus: {
        enrolledCount: Number,
        instructorAddConsentRequired: Boolean,
        instructorDropConsentRequired: Boolean,
        maxEnroll: Number,
        maxWaitlist: Number,
        minEnroll: Number,
        status: {
            code: String,
            description: String,
        },
        waitlistedCount: Number,
    },
    allowedUnits: {
        forAcademicProgress: Number,
        forFinancialAid: Number,
        maximum: Number,
        minimum: Number,
    },
    anyFeesExist: Boolean,
    anyPrintInScheduleOfClasses: Boolean,
    anyPrintInstructors: Boolean,
    assignedClassMaterials: {
        noneAssigned: Boolean,
        status: {
        },
    },
    blindGrading: Boolean,
    classDescription: String, // coverage: 2.3%
    classTitle: String, // coverage: 2.2%
    contactHours: Number,
    course: {
        catalogNumber: {
            formatted: String,
            number: String,
            prefix: String, // coverage: 12.9%
            suffix: String, // coverage: 24.3%
        },
        displayName: String,
        identifiers: [{
            id: String,
            type: { type: String },
        }],
        requisites: { // coverage: 0.8%
            code: String,
            description: String,
            formalDescription: String,
        },
        subjectArea: {
            code: String,
            description: String, // coverage: 99.1%
        },
        title: String,
        transcriptTitle: String,
    },
    displayName: String,
    finalExam: {
        code: String,
        description: String,
    },
    gradingBasis: {
        code: String,
        description: String,
    },
    instructionMode: {
        code: String,
        description: String, // coverage: 99.3%
    },
    lastCancelled: String, // coverage: 1.6%
    number: String,
    offeringNumber: Number,
    primaryComponent: {
        code: String,
        description: String,
    },
    requirementDesignation: { // coverage: 2.1%
        code: String,
        description: String,
    },
    requisites: { // coverage: 0.5%
        code: String,
        description: String,
        formalDescription: String,
    },
    session: {
        id: String,
        name: String,
        term: {
            id: String,
            name: String,
        },
    },
    status: {
        code: String,
        description: String,
    },
}

const ClassSchema = new Schema(ClassSchemaObject);

export const ClassModel = mongoose.model("sis_class", ClassSchema, "sis_class");
export type ClassType = InferSchemaType<typeof ClassSchema>;

const ClassHistorySchema = createHistorySchema(ClassSchemaObject, "sis_class");

export const ClassHistoryModel = mongoose.model("sis_class_history", ClassHistorySchema, "sis_class_history");
export type ClassHistoryType = InferSchemaType<typeof ClassHistorySchema>;