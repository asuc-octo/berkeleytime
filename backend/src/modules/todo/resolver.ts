import { Resolver, Arg, Query } from "type-graphql";

import { Todo } from "../../entities";
import TodoService from "./service";

@Resolver(Todo)
export default class TodoResolver {
  constructor(private todoService: TodoService) {}

  @Query((returns) => Todo)
  async get(@Arg("id") id: string) {
    const todo = await this.todoService.getById(id);

    return todo;
  }
}
