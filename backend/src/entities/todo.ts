import { ObjectType, Field, ID, Int, InputType } from "type-graphql";
import { MaxLength, MinLength } from "class-validator";
// You can add here your ORM declaration (TypeORM, TypeGoose...)

@ObjectType()
export class Todo {
  @Field((type) => ID)
  id: string;

  @Field()
  content: string;

  @Field()
  createdAt: Date;

  @Field()
  isDone: boolean;
}

@InputType()
export class NewTodoInput {
  @Field()
  @MaxLength(300)
  @MinLength(1)
  content: string;
}
