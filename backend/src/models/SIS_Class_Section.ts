import _ from "lodash";
import mongoose from "mongoose";
import timeMachine from "mongoose-time-machine";
import * as GQL from "type-graphql";

import { CalAnswers_GradeService } from "#src/graphql/services/CalAnswers_Grade";
import { CalAnswers_Grade_Schema } from "#src/models/CalAnswers_Grade";
import { SIS_Class_Schema } from "#src/models/SIS_Class";
import {
  GraphQlTypelessData,
  SIS_Code,
  enrollmentStatus,
} from "#src/models/subtypes";

import Typegoose from "@typegoose/typegoose";

@GQL.ObjectType()
@Typegoose.modelOptions({
  schemaOptions: { _id: false, minimize: false, strict: false },
})
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
@Typegoose.modelOptions({
  schemaOptions: { _id: false, minimize: false, strict: false },
})
class combination {
  @GQL.Field()
  @Typegoose.prop()
  id: string;

  @GQL.Field()
  @Typegoose.prop()
  description: string;

  @GQL.Field()
  @Typegoose.prop()
  type: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  enrolledCountCombinedSections: number;

  @GQL.Field()
  @Typegoose.prop()
  waitlistedCountCombinedSections: number;

  @GQL.Field()
  @Typegoose.prop()
  maxEnrollCombinedSections: number;

  @GQL.Field()
  @Typegoose.prop()
  maxWaitlistCombinedSections: number;

  @GQL.Field(() => [Number])
  @Typegoose.prop({ type: [Number] })
  combinedSections: number[];
}

@GQL.ObjectType()
@Typegoose.modelOptions({
  schemaOptions: { _id: false, minimize: false, strict: false },
})
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
@Typegoose.modelOptions({
  schemaOptions: { _id: false, minimize: false, strict: false },
})
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
@Typegoose.modelOptions({
  schemaOptions: { _id: false, minimize: false, strict: false },
})
class instructor {
  @GQL.Field(() => [instructor_identifiers])
  @Typegoose.prop({ type: [instructor_identifiers] })
  identifiers: instructor_identifiers[];

  @GQL.Field(() => [instructor_names])
  @Typegoose.prop({ type: [instructor_names], default: void 0 }) // SIS API sets 'meetings.assignedInstructors.instructor.names' to undefined if result array is empty, so must override default
  names: instructor_names[];
}

@GQL.ObjectType()
@Typegoose.modelOptions({
  schemaOptions: { _id: false, minimize: false, strict: false },
})
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
@Typegoose.modelOptions({
  schemaOptions: { _id: false, minimize: false, strict: false },
})
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
@Typegoose.modelOptions({
  schemaOptions: { _id: false, minimize: false, strict: false },
})
class meetingTopic {
  @GQL.Field()
  @Typegoose.prop()
  description: string;
}
@GQL.ObjectType()
@Typegoose.modelOptions({
  schemaOptions: { _id: false, minimize: false, strict: false },
})
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
  startTime: string;

  @GQL.Field()
  @Typegoose.prop()
  endTime: string;

  @GQL.Field(() => [assignedInstructor])
  @Typegoose.prop({ type: [assignedInstructor], default: void 0 }) // SIS API sets 'meetings.assignedInstructors' to undefined if result is empty, so must override default
  assignedInstructors: assignedInstructor[];

  @GQL.Field()
  @Typegoose.prop()
  startDate: string;

  @GQL.Field()
  @Typegoose.prop()
  endDate: string;

  @GQL.Field()
  @Typegoose.prop()
  meetingTopic: meetingTopic;
}

@GQL.ObjectType()
@Typegoose.modelOptions({
  schemaOptions: { _id: false, minimize: false, strict: false },
})
class sectionAttribute {
  @GQL.Field()
  @Typegoose.prop()
  attribute: SIS_Code_Formal;

  @GQL.Field()
  @Typegoose.prop()
  value: SIS_Code_Formal;
}

@GQL.ObjectType()
@Typegoose.modelOptions({ schemaOptions: { minimize: false } })
@Typegoose.plugin(timeMachine.plugin, {
  name: "sis_class_section_history",
  omit: ["_created", "_id", "_updated", "_version"],
})
export class SIS_Class_Section_Schema extends mongoose.Schema {
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
  class: SIS_Class_Schema;

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
  combination: combination;

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

  @GQL.Field(() => [meeting])
  @Typegoose.prop({ type: [meeting], default: void 0 }) // SIS API sets preparation.requiredCourses.courses to undefined if there are no required courses, so must override default empty []
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

  @GQL.Field(() => [CalAnswers_Grade_Schema])
  async _grades() {
    const [year, semester, ...rest] = this.class.session.term.name.split(" ");
    return await CalAnswers_GradeService.get({
      CourseControlNbr: this.id,
      term: {
        year,
        semester,
      },
    });
  }
}

export const SIS_Class_Section_Model = Typegoose.getModelForClass(
  SIS_Class_Section_Schema,
  {
    schemaOptions: {
      collection: "sis_class_section",
      id: false,
      minimize: false,
      strict: false,
      timestamps: { createdAt: "_created", updatedAt: "_updated" },
      toObject: { virtuals: true },
      toJSON: {
        getters: true,
        virtuals: true,
      },
      versionKey: "_version",
    },
  }
);
