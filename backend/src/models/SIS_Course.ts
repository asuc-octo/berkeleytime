// https://dev.to/smithg09/building-graphql-api-with-nodejs-typegraphql-typegoose-and-troubleshooting-common-challenges-9oa
// https://github.com/DevUnderflow/nx-node-apollo-grahql-mongo/commit/06ee5fb8a1e50d434b5001e796b0b8d181daf874;
import { GraphQLScalarType } from "graphql";
import mongoose from "mongoose";
import timeMachine from "mongoose-time-machine";
import * as GQL from "type-graphql";

import { OneOf } from "#src/types";

import Typegoose from "@typegoose/typegoose";

const GraphQlTypelessData = new GraphQLScalarType({
  name: "TypelessData",
  serialize: (value) => value,
});

type ENUM_GRADES =
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D+"
  | "D"
  | "D-"
  | "F";

mongoose.pluralize(null);

@GQL.ObjectType()
class SIS_Code {
  @GQL.Field()
  @Typegoose.prop()
  code: string;

  @GQL.Field()
  @Typegoose.prop()
  description: string;
}

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
class creditRestriction {
  @GQL.Field()
  @Typegoose.prop()
  restrictionText: string;

  @GQL.Field()
  @Typegoose.prop()
  restrictionCourses: value;
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
  catalogNumber: catalogNumber;

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
  credit: credit;

  @GQL.Field()
  @Typegoose.prop()
  creditRestriction: creditRestriction;

  @GQL.Field()
  @Typegoose.prop()
  contactHours: number;

  @GQL.Field()
  @Typegoose.prop()
  createdDate: string;

  @GQL.Field(() => [identifier])
  @Typegoose.prop({ type: [identifier] })
  identifiers: identifier[];

  @GQL.Field()
  @Typegoose.prop()
  description: string; // legacy field equivalent: description

  @GQL.Field()
  @Typegoose.prop() // legacy field equivalent: title
  title: string;

  @GQL.Field()
  @Typegoose.prop()
  catalogNumber___formatted: string; // legacy field equivalent: course_number

  @GQL.Field(() => GraphQlTypelessData)
  @Typegoose.prop() // legacy field equivalent: units
  credit___value: object;

  @GQL.Field()
  @Typegoose.prop()
  preparation___requiredText: string; // legacy field equivalent: prerequisites

  @GQL.Field()
  @Typegoose.prop()
  subjectArea: SIS_Code;
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
