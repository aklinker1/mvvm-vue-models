import { computed, ref } from "vue";
import { defineVueModel } from "../../library";
import MockApi from "../utils/MockApi";
import { RequestState } from "../utils/RequestState";

export const useTodoViewModel = defineVueModel("Todo", (todoId: number) => {
  const todo = ref<Todo | undefined>();

  const requestState = ref<RequestState>(RequestState.SUCCESS);
  const isLoading = computed(() => requestState.value === RequestState.LOADING);
  const loadTodo = async () => {
    requestState.value = RequestState.LOADING;
    todo.value = await MockApi.getTodo(todoId);
    requestState.value = RequestState.SUCCESS;
  };

  const toggleCompletedRequestState = ref(RequestState.SUCCESS);
  const isTogglingCompleted = computed(
    () => toggleCompletedRequestState.value === RequestState.LOADING
  );
  const toggleCompleted = async () => {
    toggleCompletedRequestState.value = RequestState.LOADING;
    if (todo.value == null) {
      await loadTodo();
    }
    if (todo.value == null) {
      console.warn("Attempted to toggle a todo that doesn't exist");
      return;
    }
    const newTodo: Todo = {
      ...todo.value,
      completed: !todo.value.completed,
    };
    todo.value = newTodo;
    todo.value = await MockApi.updateTodo(newTodo);
    toggleCompletedRequestState.value = RequestState.SUCCESS;
  };

  return {
    todo,
    requestState,
    isLoading,
    loadTodo,

    toggleCompleted,
    isTogglingCompleted,
  };
});
