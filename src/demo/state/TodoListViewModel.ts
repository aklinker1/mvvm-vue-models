import { computed, ref } from "vue";
import { defineVueModel } from "../../library";
import MockApi from "../utils/MockApi";
import { RequestState } from "../utils/RequestState";

export const useTodoListViewModel = defineVueModel("TodoList", () => {
  const allTodos = ref<TodoSearchResult[]>([]);
  const completedTodos = computed(() =>
    allTodos.value.filter((todo) => todo.completed)
  );
  const incompleteTodos = computed(() =>
    allTodos.value.filter((todo) => !todo.completed)
  );

  const requestState = ref(RequestState.SUCCESS);
  const isLoading = computed(() => requestState.value === RequestState.LOADING);
  const loadTodos = async () => {
    console.log("Loading todos...");
    requestState.value = RequestState.LOADING;
    allTodos.value = await MockApi.getTodos();
    requestState.value = RequestState.SUCCESS;
  };

  return {
    allTodos,
    completedTodos,
    incompleteTodos,

    loadTodos,
    requestState,
    isLoading,
  };
});
