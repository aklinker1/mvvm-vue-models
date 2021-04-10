const todos: Record<number, Omit<Todo, "id">> = {
  1: {
    name: "Update README.md",
    createdAt: new Date(),
    completed: false,
    notes: "Make sure the new feature has been added to the documentation",
  },
  2: {
    name: "Update GitHub releases",
    createdAt: new Date(),
    completed: false,
    notes: "Delete the old artifacts from v1.2.1",
  },
  3: {
    name: "Tried out Vue Models!",
    createdAt: new Date(),
    completed: true,
    notes: "Tried out the Vue Models library by aklinker1",
  },
};

export default {
  _sleep(ms: number): Promise<void> {
    return new Promise<void>((res) => setTimeout(res, ms));
  },

  async getTodos(): Promise<TodoSearchResult[]> {
    await this._sleep(500);
    return Object.entries(todos)
      .sort((l, r) => l[1].createdAt.getTime() - r[1].createdAt.getTime())
      .map(([id, data]) => ({
        id: Number(id),
        completed: data.completed,
        name: data.name,
      }));
  },

  async getTodo(id: number): Promise<Todo | undefined> {
    await this._sleep(500);
    if (todos[id] == null) return undefined;

    return {
      id,
      ...todos[id],
    };
  },

  async addTodo(newTodo: Omit<Todo, "id">): Promise<Todo> {
    await this._sleep(500);
    const id = Object.entries(todos).length + 1;
    todos[id] = newTodo;

    return {
      id,
      ...newTodo,
    };
  },

  async updateTodo(newTodo: Todo): Promise<Todo> {
    await this._sleep(500);
    const { id, ...todoData } = newTodo;
    todos[id] = todoData;
    return { ...newTodo };
  },

  async deleteTodo({ id }: { id: number }): Promise<Todo> {
    await this._sleep(500);
    const deleted: Todo = {
      id,
      ...todos[id],
    };
    delete todos[id];
    return deleted;
  },
};
