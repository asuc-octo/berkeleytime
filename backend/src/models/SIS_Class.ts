import mongoose from "mongoose";
import timeMachine from "mongoose-time-machine";
import * as GQL from "type-graphql";

import { SIS_CourseSchema } from "#src/models/SIS_Course";
import { GraphQlTypelessData } from "#src/models/_index";
import { SIS_Code } from "#src/models/subtypes";

import Typegoose from "@typegoose/typegoose";

mongoose.pluralize(null);

@GQL.ObjectType()
class class_term {
  @GQL.Field()
  @Typegoose.prop()
  id: string;

  @GQL.Field()
  @Typegoose.prop()
  name: string;
}
@GQL.ObjectType()
class session {
  @GQL.Field()
  @Typegoose.prop()
  id: string;

  @GQL.Field()
  @Typegoose.prop()
  name: string;

  @GQL.Field()
  @Typegoose.prop()
  term: class_term;
}

@GQL.ObjectType()
class enrollmentStatus {
  @GQL.Field()
  @Typegoose.prop()
  status: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  enrolledCount: number;

  @GQL.Field()
  @Typegoose.prop()
  minEnroll: number;

  @GQL.Field()
  @Typegoose.prop()
  maxEnroll: number;

  @GQL.Field()
  @Typegoose.prop()
  maxWaitlist: number;

  @GQL.Field()
  @Typegoose.prop()
  instructorAddConsentRequired: boolean;

  @GQL.Field()
  @Typegoose.prop()
  instructorDropConsentRequired: boolean;

  @GQL.Field()
  @Typegoose.prop()
  waitlistedCount: number;

  // Only used in Class Section
  @GQL.Field()
  @Typegoose.prop()
  openReserved?: number;

  // Only used in Class Section
  @GQL.Field()
  @Typegoose.prop()
  reservedCount?: number;
}

@GQL.ObjectType()
class allowedUnits {
  @GQL.Field()
  @Typegoose.prop()
  minimum: number;

  @GQL.Field()
  @Typegoose.prop()
  maximum: number;

  @GQL.Field()
  @Typegoose.prop()
  forAcademicProgress: number;

  @GQL.Field()
  @Typegoose.prop()
  forFinancialAid: number;
}

@GQL.ObjectType()
class assignedClassMaterials {
  @GQL.Field()
  @Typegoose.prop()
  noneAssigned: boolean;
}

@GQL.ObjectType()
@Typegoose.plugin(timeMachine.plugin, {
  name: "sis_class_history",
  omit: ["_created", "_id", "_updated", "_version"],
})
export class SIS_ClassSchema {
  @GQL.Field(() => GraphQlTypelessData)
  _doc: object;

  @GQL.Field(() => GQL.ID)
  readonly _id: Typegoose.mongoose.Types.ObjectId;

  @GQL.Field()
  @Typegoose.prop()
  readonly _created: Date;

  @GQL.Field()
  @Typegoose.prop()
  readonly _updated: Date;

  @GQL.Field()
  @Typegoose.prop()
  readonly _version: number;

  @GQL.Field(() => SIS_CourseSchema)
  @Typegoose.prop({ type: SIS_CourseSchema })
  course: typeof SIS_CourseSchema;

  @GQL.Field()
  @Typegoose.prop()
  allowedUnits: allowedUnits;

  @GQL.Field()
  @Typegoose.prop()
  aggregateEnrollmentStatus: enrollmentStatus;

  @GQL.Field()
  @Typegoose.prop()
  anyFeesExist: boolean;

  @GQL.Field()
  @Typegoose.prop()
  anyPrintInScheduleOfClasses: boolean;

  @GQL.Field()
  @Typegoose.prop()
  anyPrintInstructors: boolean;

  @GQL.Field()
  @Typegoose.prop()
  assignedClassMaterials: assignedClassMaterials;

  @GQL.Field()
  @Typegoose.prop()
  blindGrading: boolean;

  @GQL.Field()
  @Typegoose.prop()
  contactHours: number;

  @GQL.Field()
  @Typegoose.prop()
  displayName: string;

  @GQL.Field()
  @Typegoose.prop()
  finalExam: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  gradingBasis: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  instructionMode: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  offeringNumber: number;

  @GQL.Field()
  @Typegoose.prop()
  primaryComponent: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  status: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  number: number;

  @GQL.Field()
  @Typegoose.prop()
  session: session;
}
export const SIS_Class = Typegoose.getModelForClass(SIS_ClassSchema, {
  schemaOptions: {
    collection: "sis_class",
    id: false,
    minimize: false,
    strict: false,
    timestamps: { createdAt: "_created", updatedAt: "_updated" },
    toJSON: {
      getters: true,
      transform: (doc, ret, options) => {
        delete ret._created;
        delete ret._id;
        delete ret._updated;
        delete ret._version;
        return ret;
      },
    },
    versionKey: "_version",
  },
});

// ******************************** SIS Class Section

@GQL.ObjectType()
class association {
  @GQL.Field()
  @Typegoose.prop()
  primary: boolean;

  @GQL.Field()
  @Typegoose.prop()
  primaryAssociatedComponent: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  primaryAssociatedSectionId: number;

  @GQL.Field(() => [Number])
  @Typegoose.prop({ type: [Number] })
  primaryAssociatedSectionIds: number[];

  @GQL.Field()
  @Typegoose.prop()
  associatedClass: number;
}

@GQL.ObjectType()
class instructor_identifiers {
  @GQL.Field()
  @Typegoose.prop()
  type: string;

  @GQL.Field()
  @Typegoose.prop()
  id: string;

  @GQL.Field()
  @Typegoose.prop()
  disclose: boolean;
}

@GQL.ObjectType()
class instructor_names {
  @GQL.Field()
  @Typegoose.prop()
  type: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  familyName: string;

  @GQL.Field()
  @Typegoose.prop()
  givenName: string;

  @GQL.Field()
  @Typegoose.prop()
  formattedName: string;

  @GQL.Field()
  @Typegoose.prop()
  disclose: boolean;

  @GQL.Field()
  @Typegoose.prop()
  uiControl: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  fromDate: string;
}

@GQL.ObjectType()
class instructor {
  @GQL.Field(() => [instructor_identifiers])
  @Typegoose.prop({ type: [instructor_identifiers] })
  identifiers: instructor_identifiers[];

  @GQL.Field(() => [instructor_names])
  @Typegoose.prop({ type: [instructor_names] })
  names: instructor_names[];
}

@GQL.ObjectType()
class SIS_Code_Formal {
  @GQL.Field()
  @Typegoose.prop()
  code: string;

  @GQL.Field()
  @Typegoose.prop()
  description: string;

  @GQL.Field()
  @Typegoose.prop()
  formalDescription: string;
}

@GQL.ObjectType()
class assignedInstructor {
  @GQL.Field()
  @Typegoose.prop()
  assignmentNumber: number;

  @GQL.Field()
  @Typegoose.prop()
  instructor: instructor;

  @GQL.Field()
  @Typegoose.prop()
  role: SIS_Code_Formal;

  @GQL.Field()
  @Typegoose.prop()
  contactMinutes: number;

  @GQL.Field()
  @Typegoose.prop()
  printInScheduleOfClasses: boolean;

  @GQL.Field()
  @Typegoose.prop()
  gradeRosterAccess: SIS_Code_Formal;
}

@GQL.ObjectType()
class meeting {
  @GQL.Field()
  @Typegoose.prop()
  number: number;

  @GQL.Field()
  @Typegoose.prop()
  meetsMonday: boolean;

  @GQL.Field()
  @Typegoose.prop()
  meetsTuesday: boolean;

  @GQL.Field()
  @Typegoose.prop()
  meetsWednesday: boolean;

  @GQL.Field()
  @Typegoose.prop()
  meetsThursday: boolean;

  @GQL.Field()
  @Typegoose.prop()
  meetsFriday: boolean;

  @GQL.Field()
  @Typegoose.prop()
  meetsSaturday: boolean;

  @GQL.Field()
  @Typegoose.prop()
  meetsSunday: boolean;

  @GQL.Field()
  @Typegoose.prop()
  startTime: boolean;

  @GQL.Field()
  @Typegoose.prop()
  endTime: boolean;

  @GQL.Field(() => [assignedInstructor])
  @Typegoose.prop({ type: [assignedInstructor] })
  assignedInstructors: assignedInstructor[];

  @GQL.Field()
  @Typegoose.prop()
  startDate: string;

  @GQL.Field()
  @Typegoose.prop()
  endDate: string;
}

@GQL.ObjectType()
class sectionAttribute {
  @GQL.Field()
  @Typegoose.prop()
  attribute: SIS_Code_Formal;

  @GQL.Field()
  @Typegoose.prop()
  value: SIS_Code_Formal;
}

@GQL.ObjectType()
@Typegoose.plugin(timeMachine.plugin, {
  name: "sis_class_section_history",
  omit: ["_created", "_id", "_updated", "_version"],
})
export class SIS_Class_SectionSchema {
  @GQL.Field(() => GraphQlTypelessData)
  _doc: object;

  @GQL.Field(() => GQL.ID)
  readonly _id: Typegoose.mongoose.Types.ObjectId;

  @GQL.Field()
  @Typegoose.prop()
  readonly _created: Date;

  @GQL.Field()
  @Typegoose.prop()
  readonly _updated: Date;

  @GQL.Field()
  @Typegoose.prop()
  readonly _version: number;

  @GQL.Field()
  @Typegoose.prop()
  class: SIS_ClassSchema;

  @GQL.Field()
  @Typegoose.prop()
  id: number;

  @GQL.Field()
  @Typegoose.prop()
  academicGroup: SIS_Code_Formal;

  @GQL.Field()
  @Typegoose.prop()
  academicOrganization: SIS_Code_Formal;

  @GQL.Field()
  @Typegoose.prop()
  addConsentRequired: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  association: association;

  @GQL.Field()
  @Typegoose.prop()
  component: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  displayName: string;

  @GQL.Field()
  @Typegoose.prop()
  dropConsentRequired: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  endDate: string;

  @GQL.Field()
  @Typegoose.prop()
  enrollmentStatus: enrollmentStatus;

  @GQL.Field()
  @Typegoose.prop()
  feesExist: boolean;

  @GQL.Field()
  @Typegoose.prop()
  graded: boolean;

  @GQL.Field()
  @Typegoose.prop()
  instructorAddConsentRequired: boolean;

  @GQL.Field()
  @Typegoose.prop()
  instructionMode: SIS_Code;

  @GQL.Field(() => meeting)
  @Typegoose.prop({ type: meeting })
  meetings: meeting[];

  @GQL.Field()
  @Typegoose.prop()
  number: string;

  @GQL.Field()
  @Typegoose.prop()
  printInScheduleOfClasses: boolean;

  @GQL.Field()
  @Typegoose.prop()
  roomShare: boolean;

  @GQL.Field(() => [sectionAttribute])
  @Typegoose.prop({ type: [sectionAttribute] })
  sectionAttributes: sectionAttribute[];

  @GQL.Field()
  @Typegoose.prop()
  startDate: string;

  @GQL.Field()
  @Typegoose.prop()
  status: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  type: SIS_Code_Formal;
}
export const SIS_Class_Section = Typegoose.getModelForClass(
  SIS_Class_SectionSchema,
  {
    schemaOptions: {
      collection: "sis_class_section",
      id: false,
      minimize: false,
      strict: false,
      timestamps: { createdAt: "_created", updatedAt: "_updated" },
      toJSON: {
        getters: true,
      },
      versionKey: "_version",
    },
  }
);
