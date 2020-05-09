import { Todo, NewTodoInput } from "../../entities";

export default class TodoService {
  public async getById(id: string): Promise<Todo> {
    return {
      id,
      isDone: false,
      content: "test",
      createdAt: new Date(),
    };
  }

  public async addTodo(data: NewTodoInput): Promise<Todo> {
    return {
      id: "test",
      content: data.content,
      createdAt: new Date(),
      isDone: false,
    };
  }
}
