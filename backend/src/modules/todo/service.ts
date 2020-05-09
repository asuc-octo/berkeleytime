import { Todo } from "../../entities";

export default class TodoService {
  async getById(id: string): Promise<Todo> {
    return {
      id,
      isDone: false,
      content: "test",
      createdAt: new Date(),
    };
  }
}
