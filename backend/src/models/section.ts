import { schemaOptions } from './common';
import { descriptor, identifier } from '../utils/sis';
import { classSchema } from './class';
import mongoose, { InferSchemaType, Schema } from 'mongoose';

const party = {
    id: String,
    name: String,
}

// source: https://developers.api.berkeley.edu/api/18/interactive-docs
const sectionSchemaObject = {
    id: Number,
    class: classSchema,
    number: String,
    component: descriptor,
    displayName: String,
    instructionMode: descriptor,
    type: { type: descriptor },
    academicOrganization: descriptor,
    academicGroup: descriptor,
    startDate: Date,
    endDate: Date,
    status: descriptor,
    cancelDate: Date, // The docs say "cancelleDate" but the API returns "cancelDate"
    association: {
        primary: Boolean,
        primaryAssociatedComponent: descriptor,
        primaryAssociatedSectionId: Number,
        primaryAssociatedSectionIds: [Number],
        associatedClass: Number,
    },
    enrollmentStatus: {
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
    printInScheduleOfClasses: Boolean,
    addConsentRequired: descriptor,
    dropConsentRequired: descriptor,
    graded: Boolean,
    feesExist: Boolean,
    characteristics: [descriptor],
    roomShare: Boolean,
    sectionAttributes: [{
        attribute: descriptor,
        value: descriptor,
    }],
    roomCharacteristics: [{
        code: String,
        description: String,
        formalDescription: String,
        active: Boolean,
        fromDate: Date,
        toDate: Date,
        quantity: Number,
    }],
    meetings: [{
        number: Number,
        meetsDays: String,
        meetsMonday: Boolean,
        meetsTuesday: Boolean,
        meetsWednesday: Boolean,
        meetsThursday: Boolean,
        meetsFriday: Boolean,
        meetsSaturday: Boolean,
        meetsSunday: Boolean,
        startTime: String,
        endTime: String,
        location: descriptor,
        building: descriptor,
        assignedInstructors: [{
            assignmentNumber: Number,
            instructor: {
                identifiers: [identifier],
                names: [{
                    type: { type: descriptor },
                    familyName: String,
                    givenName: String,
                    middleName: String,
                    suffixName: String,
                    formattedName: String,
                    perferred: Boolean,
                    disclose: Boolean,
                    uiControl: descriptor,
                    lastChangedBy: party,
                    fromDate: Date,
                    toDate: Date,
                }],
                /*  There are additional optional fields in the "person" model,
                    but they are not typically included in a section response,
                    so I shall exclude them from here to minimize clutter.      */
            },
            role: descriptor,
            contactMinutes: Number,
            printInScheduleOfClasses: Boolean,
            gradeRosterAccess: descriptor,
        }],
        startDate: Date,
        endDate: Date,
        meetingTopic: descriptor,
        meetingDescription: String,
    }],
    exams: [{
        number: Number,
        type: { type: descriptor },
        location: descriptor,
        building: descriptor,
        date: Date,
        startTime: String,
        endTime: String,
    }],
    combination: {
        id: String,
        description: String,
        type: { type: descriptor },
        enrolledCountCombinedSections: Number,
        waitlistedCountCombinedSections: Number,
        maxEnrollCombinedSections: Number,
        maxWaitlistCombinedSections: Number,
        combinedSections: [Number],
    },
}

const sectionSchema = new Schema(sectionSchemaObject, schemaOptions);
export const SectionModel = mongoose.model('Section', sectionSchema)
export type SectionType = InferSchemaType<typeof sectionSchema>
