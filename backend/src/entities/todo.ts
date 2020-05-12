import { ObjectType, Field, ID } from "type-graphql";
import { prop } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongodb";

@ObjectType()
export class Todo extends TimeStamps {
  @Field()
  readonly _id: ObjectId;

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
