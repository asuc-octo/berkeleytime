import { GraphQLScalarType } from "graphql";
import * as GQL from "type-graphql";

import Typegoose from "@typegoose/typegoose";

@GQL.ObjectType()
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
