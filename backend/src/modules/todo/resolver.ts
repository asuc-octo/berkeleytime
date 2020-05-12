import { Resolver, Arg, Query, Mutation } from "type-graphql";
import { Service } from "typedi";

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
  async get(@Arg("id") id: string) {
    const todo = await this.todoService.getById(id);

    return todo;
  }

  @Mutation((returns) => Todo)
  async addTodo(@Arg("newTodoData") newTodoData: NewTodoInput): Promise<Todo> {
    const todo = await this.todoService.addTodo(newTodoData);
    return todo;
  }
}
