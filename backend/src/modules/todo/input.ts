import { Field, InputType } from "type-graphql";
import { MaxLength, MinLength } from "class-validator";

@InputType()
export class NewTodoInput {
  @Field()
  @MaxLength(300)
  @MinLength(1)
  content: string;
}
