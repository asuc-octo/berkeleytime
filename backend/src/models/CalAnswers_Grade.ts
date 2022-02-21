import mongoose from "mongoose";
import * as GQL from "type-graphql";

import {
  SIS_ClassSchema,
  SIS_Class_SectionSchema,
} from "#src/models/SIS_Class";
import { GraphQlTypelessData } from "#src/models/subtypes";

import Typegoose from "@typegoose/typegoose";

type ENUM_GRADES =
  | "A"
  | "A+"
  | "A-"
  | "B"
  | "B+"
  | "B-"
  | "C"
  | "C+"
  | "C-"
  | "D"
  | "D+"
  | "D-"
  | "F"
  | "Credit"
  | "High Honors"
  | "Honors"
  | "In Progress"
  | "Incomplete"
  | "Missing"
  | "No Credit"
  | "Not Pass"
  | "Not Reported"
  | "Pass"
  | "Pass Conditional"
  | "Review Deferred"
  | "Satisfactory"
  | "Unknown"
  | "Unsatisfactory"
  | "Withdrawn";

mongoose.pluralize(null);

@GQL.ObjectType()
class grade_term {
  @GQL.Field()
  @Typegoose.prop()
  year: number;

  @GQL.Field()
  @Typegoose.prop()
  month: number;

  @GQL.Field()
  @Typegoose.prop()
  semester: string;
}

@GQL.ObjectType()
export class CalAnswers_GradeSchema {
  @GQL.Field(() => GraphQlTypelessData)
  _doc: object;

  @GQL.Field()
  @Typegoose.prop()
  readonly _id: string;

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
  GradeSortNbr: number;

  @GQL.Field()
  @Typegoose.prop()
  EnrollmentCnt: number;

  @GQL.Field()
  @Typegoose.prop()
  CourseControlNbr: number;

  @GQL.Field(() => [String])
  @Typegoose.prop({ type: [String] })
  InstructorName: string[];

  @GQL.Field()
  @Typegoose.prop()
  CourseSubjectShortNm: string;

  @GQL.Field()
  @Typegoose.prop()
  CourseNumber: string;

  @GQL.Field()
  @Typegoose.prop()
  SectionNbr: string;

  @GQL.Field()
  @Typegoose.prop()
  GradeSubtypeDesc: string;

  @GQL.Field()
  @Typegoose.prop()
  GradeTypeDesc: string;

  @GQL.Field()
  @Typegoose.prop()
  GradeNm: string;

  @GQL.Field()
  @Typegoose.prop()
  CourseTitleNm: string;

  @GQL.Field()
  @Typegoose.prop()
  term: grade_term;
}
export const CalAnswers_Grade = Typegoose.getModelForClass(
  CalAnswers_GradeSchema,
  {
    schemaOptions: {
      collection: "calanswers_grade",
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
  }
);
