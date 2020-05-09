import { ObjectType, Field, ID } from "type-graphql";

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
