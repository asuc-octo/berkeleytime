import mongoose, { InferSchemaType, Schema } from 'mongoose';
import { schemaOptions } from './common';
import { descriptor, identifier } from '../utils/sis';

const t = (_: any) => true;

// source: https://developers.api.berkeley.edu/api/100/interactive-docs
const minimalCourse = {
    identifiers: [identifier],
    subjectArea: descriptor,
    catalogNumber: {
        prefix: String,
        number: String,
        suffix: String,
        formatted: String,
    },
    displayName: String,
    title: String,
    transcriptTitle: String,
}

const courseSchemaObject = {
    identifiers: [identifier],
    subjectArea: descriptor,
    catalogNumber: {
        prefix: String,
        number: String,
        suffix: String,
        formatted: String,
    },
    classSubjectArea: descriptor,
    displayName: String,
    classDisplayName: String,
    formerDisplayName: String,
    title: String,
    transcriptTitle: String,
    description: String,
    academicCareer: descriptor,
    academicGroup: descriptor,
    academicOrganization: descriptor,
    departmentNicknames: String,
    primaryInstructionMethod: descriptor,
    credit: {
        type: { type: String },
        value: {
            fixed: {
                units: Number,
            },
            range: {
                minUnits: Number,
                maxUnits: Number,
            },
            discrete: {
                units: [Number],
            },
        },
    },
    gradingBasis: descriptor,
    blindGrading: Boolean,
    status: descriptor,
    fromDate: String,
    toDate: Date,
    createdDate: Date,
    updatedDate: Date,
    printInCatalog: Boolean,
    printInstructors: Boolean,
    anyFeesExist: Boolean,
    finalExam: descriptor,
    instructorAddConsentRequired: Boolean,
    instructorDropConsentRequired: Boolean,
    allowMultipleEnrollments: Boolean,
    spansMultipleTerms: Boolean,
    multipleTermNumber: Number,
    contactHours: Number,
    workloadHours: Number,
    enrollmentUnitLoadCalculator: descriptor,
    tie: descriptor,
    cip: descriptor,
    hegis: descriptor,
    repeatability: {
        repeatable: Boolean,
        description: String,
        maxCredit: Number,
        maxCount: Number,
    },
    preparation: {
        recommendedText: String,
        recommendedCourses: [minimalCourse],
        requiredText: String,
        requiredCourses: [minimalCourse],
    },
    requisites: descriptor,
    creditRestriction: {
        restrictionText: String,
        restrictionCourses: [{
            course: minimalCourse,
            maxCreditPercentage: Number,
        }],
    },
    gradeReplacement: {
        gradeReplacementGroup: String,
        gradeReplacementText: String,
        gradeReplacementCourses: [minimalCourse],
    },
    courseObjectives: [String],
    studentLearningOutcomes: [String],
    proposedInstructors: [String],
    formatsOffered: {
        description: String,
        formats: [{
            termsAllowed: [String],
            sessionType: String,
            description: String,
            aggregateCountactHours: Number,
            aggregateMinContactHours: Number,
            aggregateMaxContactHours: Number,
            minWorkloadHours: Number,
            maxWorkloadHours: Number,
            anyFeesExist: Boolean,
            finalExam: descriptor,
            components: [{
                instructionMethod: descriptor,
                primary: Boolean,
                contactHours: Number,
                minContactHours: Number,
                maxContactHours: Number,
                finalExam: descriptor,
                feesExist: Boolean,
            }],
        }],
        typicallyOffered: {
            terms: [String],
            comments: String,
        },
        summerOnly: Boolean,
    },
    crossListing: {
        count: Number,
        courses: [String],
    },
    classCrossListing: {
        count: Number,
        courses: [String],
    },
    requirementsFulfilled: [descriptor],
}

export const courseSchema = new Schema(courseSchemaObject, schemaOptions);
export const CourseModel = mongoose.model('Course', courseSchema, 'course')
export type CourseType = InferSchemaType<typeof courseSchema>
