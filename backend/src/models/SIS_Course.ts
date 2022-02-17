// https://dev.to/smithg09/building-graphql-api-with-nodejs-typegraphql-typegoose-and-troubleshooting-common-challenges-9oa
// https://github.com/DevUnderflow/nx-node-apollo-grahql-mongo/commit/06ee5fb8a1e50d434b5001e796b0b8d181daf874;
import { Length } from "class-validator";
import { GraphQLScalarType } from "graphql";
import mongoose from "mongoose";
import timeMachine from "mongoose-time-machine";
import * as GQL from "type-graphql";

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

@GQL.ObjectType({
  description:
    "The entire SIS_Course instance from the SIS Course API with a thin wrapper on top for easy properties",
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
  subjectArea___code: string; // legacy field equivalent: abbreviation

  @GQL.Field()
  @Typegoose.prop()
  subjectArea___description: string; // legacy field equivalent: department

  /*
   * TODO: figure out what to do with not-fully-transferable fields from old Berkeleytime
   */

  /*
  @GQL.Field()
  @Typegoose.prop()
  gpa: number;

  @GQL.Field()
  @Typegoose.prop()
  letter_average: ENUM_GRADES;

  @GQL.Field()
  @Typegoose.prop()
  seats_open: number;

  @GQL.Field()
  @Typegoose.prop()
  waitlisted: number;
  */
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
