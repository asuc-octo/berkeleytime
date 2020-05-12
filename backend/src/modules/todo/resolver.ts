import { Resolver, Arg, Query, Mutation, ID } from "type-graphql";
import { Service } from "typedi";
import { ObjectId } from "mongodb";

import { Todo } from "../../entities";
import TodoService from "./service";
import { NewTodoInput } from "./input";

/*
  IMPORTANT: Your business logic must be in the service!
*/

@Service() // Dependencies injection
@Resolver((of) => Todo)
export default class TodoResolver {
  constructor(private readonly todoService: TodoService) {}

  @Query((returns) => Todo)
  async getTodo(@Arg("id") id: ObjectId) {
    const todo = await this.todoService.getById(id);

    return todo;
  }

  @Mutation((returns) => Todo)
  async createTodo(
    @Arg("createTodoData") createTodoData: NewTodoInput
  ): Promise<Todo> {
    const todo = await this.todoService.addTodo(createTodoData);
    return todo;
  }
}
