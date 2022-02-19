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
class aggregateEnrollmentStatus {
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
  aggregateEnrollmentStatus: aggregateEnrollmentStatus;

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

@GQL.ObjectType()
@Typegoose.plugin(timeMachine.plugin, {
  name: "sis_class_section_history",
  omit: ["_created", "_id", "_updated", "_version"],
})
class SIS_Class_SectionSchema {
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
