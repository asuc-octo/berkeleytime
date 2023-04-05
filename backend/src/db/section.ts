import mongoose, { Schema, InferSchemaType } from "mongoose"
import { createHistorySchema } from "../utils/history";

const SectionSchemaObject = {
    _id: Schema.Types.ObjectId,
    _created: Date,
    _updated: Date,
    _version: Number,
    academicGroup: {
        code: String,
        description: String,
        formalDescription: String,
    },
    academicOrganization: {
        code: String,
        description: String,
        formalDescription: String,
    },
    addConsentRequired: {
        code: String,
        description: String,
    },
    association: {
        associatedClass: Number,
        primary: Boolean,
        primaryAssociatedComponent: {
            code: String, // coverage: 98.3%
            description: String, // coverage: 98.3%
        },
        primaryAssociatedSectionId: Number,
        primaryAssociatedSectionIds: [Number],
    },
    cancelDate: String, // coverage: 1.2%
    class: {
        allowedUnits: {
            forAcademicProgress: Number,
            forFinancialAid: Number,
            maximum: Number,
            minimum: Number,
        },
        course: {
            catalogNumber: {
                formatted: String,
                number: String,
                prefix: String, // coverage: 14.3%
                suffix: String, // coverage: 26.9%
            },
            displayName: String,
            identifiers: [{
                id: String,
                type: { type: String },
            }],
            requisites: { // coverage: 1.2%
                code: String,
                description: String,
                formalDescription: String,
            },
            subjectArea: {
                code: String,
                description: String, // coverage: 99.9%
            },
            title: String,
            transcriptTitle: String,
        },
        displayName: String,
        gradingBasis: {
            code: String, // coverage: 98.3%
            description: String, // coverage: 98.3%
        },
        number: String,
        offeringNumber: Number,
        requirementDesignation: { // coverage: 2.6%
            code: String,
            description: String,
        },
        requisites: { // coverage: 0.4%
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
    },
    combination: { // coverage: 3.9%
        combinedSections: [Number],
        description: String,
        enrolledCountCombinedSections: Number,
        id: String,
        maxEnrollCombinedSections: Number,
        maxWaitlistCombinedSections: Number,
        type: {
            code: String,
            description: String,
        },
        waitlistedCountCombinedSections: Number,
    },
    component: {
        code: String,
        description: String,
    },
    displayName: String,
    dropConsentRequired: {
        code: String,
        description: String,
    },
    endDate: String,
    enrollmentStatus: {
        enrolledCount: Number,
        maxEnroll: Number,
        maxWaitlist: Number,
        minEnroll: Number,
        openReserved: Number,
        reservedCount: Number,
        seatReservations: [{ // coverage: 3.6%
            enrolledCount: Number,
            fromDate: String,
            maxEnroll: Number,
            number: Number,
            requirementGroup: {
                code: String,
                description: String,
            },
        }],
        status: {
            code: String,
            description: String,
        },
        waitlistedCount: Number,
    },
    exams: [{ // coverage: 4.5%
        building: {
            code: String, // coverage: 72.5%
            description: String, // coverage: 72.5%
        },
        date: String,
        endTime: String,
        location: {
            code: String, // coverage: 80.4%
            description: String, // coverage: 72.5%
        },
        number: Number,
        startTime: String,
        type: {
            code: String,
            description: String,
        },
    }],
    feesExist: Boolean,
    graded: Boolean,
    id: Number,
    instructionMode: {
        code: String,
        description: String, // coverage: 99.0%
    },
    meetings: [{ // coverage: 84.7%
        assignedInstructors: [{ // coverage: 83.9%
            assignmentNumber: Number,
            contactMinutes: Number,
            gradeRosterAccess: {
                code: String, // coverage: 98.3%
                description: String, // coverage: 98.3%
                formalDescription: String, // coverage: 98.3%
            },
            instructor: {
                identifiers: [{
                    disclose: Boolean,
                    id: String,
                    type: { type: String },
                }],
                names: [{ // coverage: 99.1%
                    disclose: Boolean,
                    familyName: String,
                    formattedName: String,
                    fromDate: String,
                    givenName: String,
                    type: {
                        code: String,
                        description: String,
                    },
                    uiControl: {
                        code: String,
                        description: String,
                    },
                }],
            },
            printInScheduleOfClasses: Boolean,
            role: {
                code: String,
                description: String,
                formalDescription: String,
            },
        }],
        building: {
            code: String, // coverage: 33.4%
            description: String, // coverage: 33.4%
        },
        endDate: String,
        endTime: String,
        location: {
            code: String, // coverage: 37.8%
            description: String, // coverage: 33.4%
        },
        meetingDescription: String, // coverage: 0.5%
        meetingTopic: {
        },
        meetsDays: String, // coverage: 40.5%
        meetsFriday: Boolean,
        meetsMonday: Boolean,
        meetsSaturday: Boolean,
        meetsSunday: Boolean,
        meetsThursday: Boolean,
        meetsTuesday: Boolean,
        meetsWednesday: Boolean,
        number: Number,
        startDate: String,
        startTime: String,
    }],
    number: String,
    printInScheduleOfClasses: Boolean,
    roomCharacteristics: [{ // coverage: 3.6%
        code: String,
        description: String,
        quantity: Number,
    }],
    roomShare: Boolean,
    sectionAttributes: [{ // coverage: 99.9%
        attribute: {
            code: String,
            description: String, // coverage: 96.7%
            formalDescription: String,
        },
        value: {
            code: String,
            description: String, // coverage: 96.7%
            formalDescription: String, // coverage: 100.0%
        },
    }],
    startDate: String,
    status: {
        code: String,
        description: String,
    },
    type: {
        code: String,
        description: String,
        formalDescription: String,
    },
}

const SectionSchema = new Schema(SectionSchemaObject)

export const SectionModel = mongoose.model("sis_class_section", SectionSchema, "sis_class_section");
export type SectionType = InferSchemaType<typeof SectionSchema>;

const SectionHistorySchema = createHistorySchema(SectionSchemaObject, "sis_class_section")

export const SectionHistoryModel = mongoose.model("sis_class_section_history", SectionHistorySchema, "sis_class_section_history");
export type SectionHistoryType = InferSchemaType<typeof SectionHistorySchema>;