import { Document, Model, Schema, model } from "mongoose";

export interface ICatalogClassMeeting {
  number?: number;
  days?: boolean[];
  startTime?: string;
  endTime?: string;
  location?: string;
  instructors?: {
    familyName?: string;
    givenName?: string;
    role?: string;
  }[];
}

export interface ICatalogClassExam {
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  number?: number;
  type?: string;
}

export interface ICatalogClassSectionAttribute {
  attribute?: {
    code?: string;
    description?: string;
    formalDescription?: string;
  };
  value?: {
    code?: string;
    description?: string;
    formalDescription?: string;
  };
}

export interface ICatalogClassSection {
  sectionId: string;
  number?: string;
  component?: string;
  online?: boolean;
  meetings?: ICatalogClassMeeting[];
  enrollmentStatus?: string;
  enrolledCount?: number;
  maxEnroll?: number;
  waitlistedCount?: number;
  maxWaitlist?: number;
}

export interface ICatalogClassItem {
  // Identity
  year: number;
  semester: string;
  termId: string;
  sessionId: string;
  subject: string;
  courseNumber: string;
  number: string;
  courseId: string;

  // Class fields
  title?: string;
  description?: string;
  gradingBasis?: string;
  finalExam?: string;
  unitsMin: number;
  unitsMax: number;
  instructionMode?: string;
  anyPrintInScheduleOfClasses?: boolean;
  requirementDesignation?: {
    code?: string;
    description?: string;
    formalDescription?: string;
  };

  // Course fields (flattened)
  courseTitle?: string;
  courseDescription?: string;
  departmentNicknames?: string;
  academicCareer?: string;
  academicOrganization?: string;
  academicOrganizationName?: string;
  allTimeAverageGrade?: number | null;
  allTimePassCount?: number | null;
  allTimeNoPassCount?: number | null;

  // Primary section fields
  primarySectionId?: string;
  primaryComponent?: string;
  primaryOnline?: boolean;
  sectionAttributes?: ICatalogClassSectionAttribute[];
  meetings?: ICatalogClassMeeting[];
  exams?: ICatalogClassExam[];

  // Pre-computed filter fields
  level?: string;
  meetingDays?: boolean[];
  meetingStartMinutes?: number | null;
  meetingEndMinutes?: number | null;
  breadthRequirements?: string[];
  universityRequirements?: string[];

  // Search fields
  searchableNames?: string[];

  // Enrollment (latest snapshot)
  enrollmentStatus?: string;
  enrolledCount?: number;
  maxEnroll?: number;
  waitlistedCount?: number;
  maxWaitlist?: number;
  activeReservedMaxCount?: number;

  // Secondary sections
  sections?: ICatalogClassSection[];

  // Pre-computed sort fields
  openSeats?: number;

  // Ratings/grades
  viewCount?: number;
  aggregatedRatings?: {
    metrics: { metricName: string; count: number; weightedAverage: number }[];
  } | null;

  // Timestamps
  updatedAt?: Date;
}

export interface ICatalogClassItemDocument
  extends ICatalogClassItem,
    Document {}

const catalogClassSchema = new Schema<ICatalogClassItem>(
  {
    // Identity
    year: { type: Number, required: true },
    semester: { type: String, required: true },
    termId: { type: String, required: true },
    sessionId: { type: String, required: true },
    subject: { type: String, required: true },
    courseNumber: { type: String, required: true },
    number: { type: String, required: true },
    courseId: { type: String, required: true },

    // Class fields
    title: { type: String },
    description: { type: String },
    gradingBasis: { type: String },
    finalExam: { type: String },
    unitsMin: { type: Number, required: true },
    unitsMax: { type: Number, required: true },
    instructionMode: { type: String },
    anyPrintInScheduleOfClasses: { type: Boolean },
    requirementDesignation: {
      code: { type: String },
      description: { type: String },
      formalDescription: { type: String },
    },

    // Course fields (flattened)
    courseTitle: { type: String },
    courseDescription: { type: String },
    departmentNicknames: { type: String },
    academicCareer: { type: String },
    academicOrganization: { type: String },
    academicOrganizationName: { type: String },
    allTimeAverageGrade: { type: Number, default: null },
    allTimePassCount: { type: Number, default: null },
    allTimeNoPassCount: { type: Number, default: null },

    // Primary section fields
    primarySectionId: { type: String },
    primaryComponent: { type: String },
    primaryOnline: { type: Boolean },
    sectionAttributes: [
      {
        _id: false,
        attribute: {
          code: { type: String },
          description: { type: String },
          formalDescription: { type: String },
        },
        value: {
          code: { type: String },
          description: { type: String },
          formalDescription: { type: String },
        },
      },
    ],
    meetings: [
      {
        _id: false,
        number: { type: Number },
        days: { type: [Boolean] },
        startTime: { type: String },
        endTime: { type: String },
        location: { type: String },
        instructors: [
          {
            _id: false,
            familyName: { type: String },
            givenName: { type: String },
            role: { type: String },
          },
        ],
      },
    ],
    exams: [
      {
        _id: false,
        date: { type: String },
        startTime: { type: String },
        endTime: { type: String },
        location: { type: String },
        number: { type: Number },
        type: { type: String },
      },
    ],

    // Pre-computed filter fields
    level: { type: String },
    meetingDays: { type: [Boolean] },
    meetingStartMinutes: { type: Number, default: null },
    meetingEndMinutes: { type: Number, default: null },
    breadthRequirements: { type: [String] },
    universityRequirements: { type: [String] },

    // Search fields
    searchableNames: { type: [String] },

    // Enrollment (latest snapshot)
    enrollmentStatus: { type: String },
    enrolledCount: { type: Number },
    maxEnroll: { type: Number },
    waitlistedCount: { type: Number },
    maxWaitlist: { type: Number },
    activeReservedMaxCount: { type: Number },

    // Secondary sections
    sections: [
      {
        _id: false,
        sectionId: { type: String },
        number: { type: String },
        component: { type: String },
        online: { type: Boolean },
        meetings: [
          {
            _id: false,
            number: { type: Number },
            days: { type: [Boolean] },
            startTime: { type: String },
            endTime: { type: String },
            location: { type: String },
            instructors: [
              {
                _id: false,
                familyName: { type: String },
                givenName: { type: String },
                role: { type: String },
              },
            ],
          },
        ],
        enrollmentStatus: { type: String },
        enrolledCount: { type: Number },
        maxEnroll: { type: Number },
        waitlistedCount: { type: Number },
        maxWaitlist: { type: Number },
      },
    ],

    // Pre-computed sort fields
    openSeats: { type: Number, default: 0 },

    // Ratings/grades
    viewCount: { type: Number, default: 0 },
    aggregatedRatings: {
      _id: false,
      type: {
        metrics: [
          {
            _id: false,
            metricName: String,
            count: Number,
            weightedAverage: Number,
          },
        ],
      },
      default: null,
    },
  },
  { timestamps: true }
);

// Base catalog query
catalogClassSchema.index({ year: 1, semester: 1 });

// Level filter
catalogClassSchema.index({ year: 1, semester: 1, level: 1 });

// Department filter
catalogClassSchema.index({ year: 1, semester: 1, academicOrganization: 1 });

// Time range filter
catalogClassSchema.index({
  year: 1,
  semester: 1,
  meetingStartMinutes: 1,
  meetingEndMinutes: 1,
});

// Enrollment status filter
catalogClassSchema.index({ year: 1, semester: 1, enrollmentStatus: 1 });

// Grading basis filter
catalogClassSchema.index({ year: 1, semester: 1, gradingBasis: 1 });

// Unique constraint for upserts
catalogClassSchema.index(
  {
    year: 1,
    semester: 1,
    sessionId: 1,
    subject: 1,
    courseNumber: 1,
    number: 1,
  },
  { unique: true }
);

export const CatalogClassModel: Model<ICatalogClassItem> =
  model<ICatalogClassItem>("catalog_classes", catalogClassSchema);
