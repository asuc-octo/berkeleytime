// https://dev.to/smithg09/building-graphql-api-with-nodejs-typegraphql-typegoose-and-troubleshooting-common-challenges-9oa
// https://github.com/DevUnderflow/nx-node-apollo-grahql-mongo/commit/06ee5fb8a1e50d434b5001e796b0b8d181daf874;
import mongoose from "mongoose";
import timeMachine from "mongoose-time-machine";
import * as GQL from "type-graphql";

import { GraphQlTypelessData } from "#src/models/_index";
import { SIS_Code } from "#src/models/subtypes";

import Typegoose from "@typegoose/typegoose";

mongoose.pluralize(null);

@GQL.ObjectType()
class catalogNumber {
  @GQL.Field()
  @Typegoose.prop()
  prefix: string;

  @GQL.Field()
  @Typegoose.prop()
  number: string;

  @GQL.Field()
  @Typegoose.prop()
  suffix: string;

  @GQL.Field()
  @Typegoose.prop()
  formatted: string;
}

@GQL.ObjectType()
class discrete {
  @GQL.Field(() => [Number])
  units: number[];
}
@GQL.ObjectType()
class fixed {
  @GQL.Field()
  units: number;
}
@GQL.ObjectType()
class range {
  @GQL.Field()
  minUnits: number;

  @GQL.Field()
  maxUnits: number;
}
@GQL.ObjectType()
class value {
  @GQL.Field()
  @Typegoose.prop()
  discrete: discrete;

  @GQL.Field()
  @Typegoose.prop()
  fixed: fixed;

  @GQL.Field()
  @Typegoose.prop()
  range: range;
}
@GQL.ObjectType()
class credit {
  @GQL.Field()
  @Typegoose.prop()
  type: "discrete" | "fixed" | "range";

  @GQL.Field()
  @Typegoose.prop()
  value: value;
}

@GQL.ObjectType()
class identifier {
  @GQL.Field()
  @Typegoose.prop()
  type: "cs-course-id" | "cms-version-independent-id" | "cms-id";

  @GQL.Field()
  @Typegoose.prop()
  id: string;
}
@GQL.ObjectType()
class course {
  @GQL.Field(() => [identifier])
  @Typegoose.prop({ type: [identifier] })
  identifiers: identifier[];

  @GQL.Field()
  @Typegoose.prop()
  displayName: string;
}
@GQL.ObjectType()
class creditRestrictionCourse {
  @GQL.Field()
  @Typegoose.prop()
  course: course;

  @GQL.Field()
  @Typegoose.prop()
  maxCreditPercentage: number;
}
@GQL.ObjectType()
class creditRestrictionCourses {
  @GQL.Field(() => [creditRestrictionCourse])
  @Typegoose.prop({ type: [creditRestrictionCourse] })
  creditRestrictionCourses: creditRestrictionCourse[];
}
@GQL.ObjectType()
class creditRestriction {
  @GQL.Field()
  @Typegoose.prop()
  restrictionText: string;

  @GQL.Field(() => creditRestrictionCourses)
  @Typegoose.prop({ type: creditRestrictionCourse })
  restrictionCourses: creditRestrictionCourses;
}

@GQL.ObjectType()
class termAllowed {
  @GQL.Field(() => [String])
  @Typegoose.prop({ type: [String] })
  termNames: string[];
}
@GQL.ObjectType()
class component {
  @GQL.Field()
  @Typegoose.prop()
  instructionMethod: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  primary: boolean;

  @GQL.Field()
  @Typegoose.prop()
  minContactHours: number;

  @GQL.Field()
  @Typegoose.prop()
  maxContactHours: number;

  @GQL.Field()
  @Typegoose.prop()
  feesExist: boolean;
}
@GQL.ObjectType()
class format {
  @GQL.Field()
  @Typegoose.prop()
  termsAllowed: termAllowed;

  @GQL.Field()
  @Typegoose.prop()
  sessionType: string;

  @GQL.Field()
  @Typegoose.prop()
  description: string;

  @GQL.Field()
  @Typegoose.prop()
  aggregateMinContactHours: number;
  @GQL.Field()
  @Typegoose.prop()
  aggregateMaxContactHours: number;
  @GQL.Field()
  @Typegoose.prop()
  minWorkloadHours: number;
  @GQL.Field()
  @Typegoose.prop()
  maxWorkloadHours: number;
  @GQL.Field()
  @Typegoose.prop()
  anyFeesExist: boolean;

  @GQL.Field(() => [component])
  @Typegoose.prop({ type: [component] })
  components: component[];
}
@GQL.ObjectType()
class course_term {
  @GQL.Field(() => [String])
  @Typegoose.prop({ type: [String] })
  termNames: string[];
}
@GQL.ObjectType()
class typicalOffer {
  @GQL.Field(() => [course_term])
  @Typegoose.prop({ type: [course_term] })
  terms: course_term[];

  @GQL.Field(() => [String])
  @Typegoose.prop({ type: [String] })
  comments: string[];
}
@GQL.ObjectType()
class formatsOffered {
  @GQL.Field()
  @Typegoose.prop()
  description: string;

  @GQL.Field(() => [format])
  @Typegoose.prop({ type: [format] })
  formats: format[];

  @GQL.Field(() => typicalOffer)
  @Typegoose.prop({ type: typicalOffer })
  typicallyOffered: typicalOffer;

  @GQL.Field()
  @Typegoose.prop()
  summerOnly: boolean;
}

@GQL.ObjectType()
class repeatability {
  @GQL.Field()
  @Typegoose.prop()
  repeatable: boolean;
}

@GQL.ObjectType()
class requiredCourse {
  @GQL.Field(() => [course])
  @Typegoose.prop({ type: [course] })
  courses: course[];
}
@GQL.ObjectType()
class preparation {
  @GQL.Field()
  @Typegoose.prop()
  requiredText: string;

  @GQL.Field()
  @Typegoose.prop()
  requiredCourses: requiredCourse;
}

@GQL.ObjectType({
  description: "A superset of all data resulting from the SIS Course API",
})
@Typegoose.plugin(timeMachine.plugin, {
  name: "sis_course_history",
  omit: ["_created", "_id", "_updated", "_version"],
})
export class SIS_CourseSchema {
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

  @GQL.Field(() => SIS_Code)
  @Typegoose.prop({ type: SIS_Code })
  academicCareer: SIS_Code;

  @GQL.Field(() => SIS_Code)
  @Typegoose.prop({ type: SIS_Code })
  academicGroup: SIS_Code;

  @GQL.Field(() => SIS_Code)
  @Typegoose.prop({ type: SIS_Code })
  academicOrganization: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  allowMultipleEnrollments: boolean;

  @GQL.Field()
  @Typegoose.prop()
  anyFeesExist: boolean;

  @GQL.Field()
  @Typegoose.prop()
  blindGrading: boolean;

  @GQL.Field()
  @Typegoose.prop()
  catalogNumber: catalogNumber; // legacy field equivalent: course_number

  @GQL.Field()
  @Typegoose.prop()
  cip: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  classDisplayName: string;

  @GQL.Field()
  @Typegoose.prop()
  classSubjectArea: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  contactHours: number;

  @GQL.Field()
  @Typegoose.prop()
  createdDate: string;

  @GQL.Field()
  @Typegoose.prop()
  credit: credit; // legacy field equivalent: units

  @GQL.Field()
  @Typegoose.prop()
  creditRestriction: creditRestriction;

  @GQL.Field()
  @Typegoose.prop()
  departmentNicknames: string;

  @GQL.Field()
  @Typegoose.prop()
  description: string; // legacy field equivalent: description

  @GQL.Field()
  @Typegoose.prop()
  displayName: string;

  @GQL.Field()
  @Typegoose.prop()
  finalExam: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  formatsOffered: formatsOffered;

  @GQL.Field()
  @Typegoose.prop()
  formerDisplayName: string;

  @GQL.Field()
  @Typegoose.prop()
  fromDate: string;

  @GQL.Field()
  @Typegoose.prop()
  gradingBasis: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  hegis: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  instructorAddConsentRequired: boolean;

  @GQL.Field()
  @Typegoose.prop()
  instructorDropConsentRequired: boolean;

  @GQL.Field(() => [identifier])
  @Typegoose.prop({ type: [identifier] })
  identifiers: identifier[];

  @GQL.Field()
  @Typegoose.prop()
  multipleTermNumber: number;

  @GQL.Field()
  @Typegoose.prop()
  preparation: preparation; // legacy field equivalent: prerequisites

  @GQL.Field()
  @Typegoose.prop()
  primaryInstructionMethod: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  printInCatalog: boolean;

  @GQL.Field()
  @Typegoose.prop()
  printInstructors: boolean;

  @GQL.Field(() => [String])
  @Typegoose.prop({ type: [String] })
  proposedInstructors: string[];

  @GQL.Field()
  @Typegoose.prop()
  repeatability: repeatability;

  @GQL.Field()
  @Typegoose.prop()
  spansMultipleTerms: boolean;

  @GQL.Field()
  @Typegoose.prop()
  status: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  subjectArea: SIS_Code;

  @GQL.Field()
  @Typegoose.prop()
  tie: SIS_Code;

  @GQL.Field()
  @Typegoose.prop() // legacy field equivalent: title
  title: string;

  @GQL.Field()
  @Typegoose.prop()
  toDate: string;

  @GQL.Field()
  @Typegoose.prop()
  transcriptTitle: string;

  @GQL.Field()
  @Typegoose.prop()
  updatedDate: string;

  @GQL.Field()
  @Typegoose.prop()
  workloadHours: number;
}

export const SIS_Course = Typegoose.getModelForClass(SIS_CourseSchema, {
  schemaOptions: {
    collection: "sis_course",
    id: false,
    minimize: false,
    strict: false,
    timestamps: { createdAt: "_created", updatedAt: "_updated" },
    toJSON: {
      getters: true,
    },
    versionKey: "_version",
  },
});
