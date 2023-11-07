import { schemaOptions } from './common';
import { descriptor } from '../utils/sis';
import { courseSchema } from './course';
import mongoose, { Schema, InferSchemaType } from 'mongoose';

// source: https://developers.api.berkeley.edu/api/18/interactive-docs
const classSchemaObject = {
    course: courseSchema,
    offeringNumber: Number,
    session: {
        id: String,
        name: String,
        term: {
            id: String,
            name: String,
        },
        timePeriods: [{
            period: descriptor,
            endDate: Date,
        }],
    },
    number: String,
    displayName: String,
    classTitle: String,
    classTranscriptTitle: String,
    classDescription: String,
    primaryComponent: descriptor,
    allowedUnits: {
        minimum: Number,
        maximum: Number,
        forAcademicProgress: Number,
        forFinancialAid: Number,
    },
    gradingBasis: descriptor,
    requirementDesignation: descriptor,
    contactHours: Number,
    blindGrading: Boolean,
    assignedClassMaterials: {
        status: descriptor,
        noneAssigned: Boolean,
        instructions: String,
        classMaterials: [{
            sequenceNumber: Number,
            type: { type: descriptor },
            status: descriptor,
            title: String,
            author: String,
            isbn: String,
            yearPublished: String,
            publisher: String,
            edition: String,
            price: {
                amount: Number,
                currency: descriptor,
            },
            notes: String,
        }],
    },
    instructionMode: descriptor,
    status: descriptor,
    lastCancelled: String,
    anyPrintInScheduleOfClasses: Boolean,
    anyPrintInstructors: Boolean,
    anyFeesExist: Boolean,
    finalExam: descriptor,
    aggregateEnrollmentStatus: {
        status: descriptor,
        enrolledCount: Number,
        reservedCount: Number,
        waitlistedCount: Number,
        minEnroll: Number,
        maxEnroll: Number,
        maxWaitlist: Number,
        openReserved: Number,
        instructorAddConsentRequired: Boolean,
        instructorDropConsentRequired: Boolean,
        seatReservations: [{
            number: Number,
            requirementGroup: descriptor,
            fromDate: Date,
            maxEnroll: Number,
            enrolledCount: Number,
        }],
    },
    requisites: descriptor, // not in the API spec but can still appear here instead of in course.requisites
}

export const classSchema = new Schema(classSchemaObject, schemaOptions);
export const ClassModel = mongoose.model('Class', classSchema);
export type ClassType = InferSchemaType<typeof classSchema>;
