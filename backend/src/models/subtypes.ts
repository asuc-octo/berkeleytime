import * as GQL from "type-graphql";

import { ENUM_IDENTIFIER_TYPES } from "#src/types";

import Typegoose from "@typegoose/typegoose";

@GQL.ObjectType()
export class Identifier {
  @GQL.Field()
  @Typegoose.prop()
  type: ENUM_IDENTIFIER_TYPES;

  @GQL.Field()
  @Typegoose.prop()
  id: string;
}
