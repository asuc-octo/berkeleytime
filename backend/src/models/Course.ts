// https://dev.to/smithg09/building-graphql-api-with-nodejs-typegraphql-typegoose-and-troubleshooting-common-challenges-9oa
// https://github.com/DevUnderflow/nx-node-apollo-grahql-mongo/commit/06ee5fb8a1e50d434b5001e796b0b8d181daf874
import { Length } from "class-validator";
import timeMachine from "mongoose-time-machine";
import { Field, ObjectType } from "type-graphql";

import { getModelForClass } from "@typegoose/typegoose";
import Typegoose from "@typegoose/typegoose";

// cannot just import @prop, @plugin because https://github.com/typegoose/typegoose/issues/214

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

// @Typegoose.plugin(timeMachine.plugin, {
//   name: "course_history",
//   omit: ["_updated"],
// })
@ObjectType()
export class CourseSchema {
  @Field()
  @Typegoose.prop()
  @Length(1, 10)
  abbreviation: string;

  @Field()
  @Typegoose.prop()
  @Length(1, 10)
  course_number: string;

  @Field()
  @Typegoose.prop()
  @Length(1, 300)
  department: string;

  @Field()
  @Typegoose.prop()
  @Length(1, 1000)
  description: string;

  @Field()
  @Typegoose.prop()
  gpa: number;

  @Field()
  @Typegoose.prop()
  enrollment: boolean;

  @Field()
  @Typegoose.prop()
  enrollment_max: number;

  @Field()
  @Typegoose.prop()
  enrollment_min: number;

  @Field()
  @Typegoose.prop()
  enrollment_percent: number;

  @Field()
  @Typegoose.prop()
  letter_average: ENUM_GRADES;

  @Field()
  @Typegoose.prop()
  @Length(1, 1000)
  prerequisites: string;

  @Field()
  @Typegoose.prop()
  seats_open: number;

  @Field()
  @Typegoose.prop()
  @Length(1, 1000)
  title: string;

  @Field()
  @Typegoose.prop()
  units_min: number;

  @Field()
  @Typegoose.prop()
  units_max: number;

  @Field()
  @Typegoose.prop()
  waitlisted: number;
}

export const Course = getModelForClass(CourseSchema, {
  schemaOptions: {
    collection: "course",
    timestamps: { createdAt: "_created", updatedAt: "_updated" },
  },
});
