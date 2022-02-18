import { GraphQLScalarType } from "graphql";
import mongoose from "mongoose";
import timeMachine from "mongoose-time-machine";
import * as GQL from "type-graphql";

import { Identifier } from "#src/models/subtypes";

import Typegoose from "@typegoose/typegoose";

const GraphQlTypelessData = new GraphQLScalarType({
  name: "TypelessData",
  serialize: (value) => value,
});
mongoose.pluralize(null);

@GQL.ObjectType()
@Typegoose.plugin(timeMachine.plugin, {
  name: "sis_class_history",
  omit: ["_updated"],
})
export class SIS_ClassSchema {
  @GQL.Field(() => GraphQlTypelessData)
  _doc: object;
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

  @GQL.Field(() => [Identifier])
  @Typegoose.prop({ type: [Identifier] })
  identifiers: Identifier[];
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
