// https://dev.to/smithg09/building-graphql-api-with-nodejs-typegraphql-typegoose-and-troubleshooting-common-challenges-9oa
// https://github.com/DevUnderflow/nx-node-apollo-grahql-mongo/commit/06ee5fb8a1e50d434b5001e796b0b8d181daf874
import { Length } from "class-validator"
import { Field, ObjectType } from "type-graphql"

import { prop, getModelForClass } from "@typegoose/typegoose"

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
  | "F"

@ObjectType()
export class CourseSchema {
  @Field()
  @prop()
  readonly _id: string

  @Field()
  @prop()
  @Length(1, 10)
  abbreviation: string

  @Field()
  @prop()
  @Length(1, 10)
  course_number: string

  @Field()
  @prop()
  @Length(1, 300)
  department: string

  @Field()
  @prop()
  @Length(1, 1000)
  description: string

  @Field()
  @prop()
  gpa: number

  @Field()
  @prop()
  enrollment: boolean

  @Field()
  @prop()
  enrollment_max: number

  @Field()
  @prop()
  enrollment_min: number

  @Field()
  @prop()
  enrollment_percent: number

  @Field()
  @prop()
  letter_average: ENUM_GRADES

  @Field()
  @prop()
  @Length(1, 1000)
  prerequisites: string

  @Field()
  @prop()
  seats_open: number

  @Field()
  @prop()
  @Length(1, 1000)
  title: string

  @Field()
  @prop()
  units_min: number

  @Field()
  @prop()
  units_max: number

  @Field()
  @prop()
  waitlisted: number
}

export const Course = getModelForClass(CourseSchema, {
  schemaOptions: {
    collection: "courses",
    timestamps: { createdAt: "_created", updatedAt: "_updated" },
  },
})
