import { GraphQLScalarType } from "graphql";
import * as GQL from "type-graphql";

import Typegoose from "@typegoose/typegoose";

@GQL.ObjectType()
@Typegoose.modelOptions({ schemaOptions: { _id: false, minimize: false } })
export class SIS_Code {
  @GQL.Field()
  @Typegoose.prop()
  code: string;

  @GQL.Field()
  @Typegoose.prop()
  description: string;
}

export const GraphQlTypelessData = new GraphQLScalarType({
  name: "TypelessData",
  serialize: (value) => value,
});

@GQL.ObjectType()
@Typegoose.modelOptions({ schemaOptions: { _id: false, minimize: false } })
export class NullObject {
  null: object;
}

@GQL.ObjectType()
@Typegoose.modelOptions({ schemaOptions: { _id: false, minimize: false } })
export class enrollmentStatus {
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

  // Only used in Class Section
  @GQL.Field()
  @Typegoose.prop()
  openReserved?: number;

  // Only used in Class Section
  @GQL.Field()
  @Typegoose.prop()
  reservedCount?: number;
}
