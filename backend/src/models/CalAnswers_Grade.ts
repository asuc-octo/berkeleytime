import { GraphQLScalarType } from "graphql";
import mongoose from "mongoose";
import * as GQL from "type-graphql";

import Typegoose from "@typegoose/typegoose";

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

const GraphQlTypelessData = new GraphQLScalarType({
  name: "TypelessData",
  serialize: (value) => value,
});
mongoose.pluralize(null);

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
