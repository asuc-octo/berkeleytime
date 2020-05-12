import { ObjectType, Field, ID } from "type-graphql";
import { prop } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

@ObjectType()
export class Todo extends TimeStamps {
  @Field(() => ID)
  _id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @prop()
  @Field()
  content!: string;

  @prop({ default: false })
  @Field()
  isDone!: boolean;
}
