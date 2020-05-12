import { Service } from "typedi";
import { ObjectId } from "mongodb";

import TodoModel from "./model";
import { Todo } from "../../entities";
import { NewTodoInput } from "./input";

@Service() // Dependencies injection
export default class TodoService {
  constructor(private readonly todoModel: TodoModel) {}

  public async getById(_id: ObjectId): Promise<Todo | null> {
    return this.todoModel.getById(_id);
  }

  public async addTodo(data: NewTodoInput): Promise<Todo> {
    const newTodo = await this.todoModel.create(data);

    // Business logic goes here
    // Example:
    // Trigger push notification, analytics, ...

    return newTodo;
  }
}
