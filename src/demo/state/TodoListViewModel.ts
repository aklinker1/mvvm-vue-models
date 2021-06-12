import { computed, ref } from 'vue';
import { defineViewModel } from '../../library';
import MockApi from '../utils/MockApi';
import { RequestState } from '../utils/RequestState';

export const useTodoListViewModel = defineViewModel({
  name: 'TodoList',
  setup() {
    const allTodos = ref<TodoSearchResult[]>([]);
    const completedTodos = computed(() => allTodos.value.filter(todo => todo.completed));
    const incompleteTodos = computed(() => allTodos.value.filter(todo => !todo.completed));

    const requestState = ref(RequestState.SUCCESS);
    const isLoading = computed(() => requestState.value === RequestState.LOADING);
    const loadTodos = async () => {
      requestState.value = RequestState.LOADING;
      allTodos.value = await MockApi.getTodos();
      requestState.value = RequestState.SUCCESS;
    };

    const toggleCompletedRequestState = ref(RequestState.SUCCESS);
    const isTogglingCompleted = computed(() => requestState.value === RequestState.LOADING);
    const toggleCompleted = async (id: number) => {
      const searchResult = allTodos.value.find(todo => todo.id === id);
      if (searchResult == null) {
        console.warn("Cannot toggle a todo that doesn't exist:", id);
        return;
      }
      searchResult.completed = !searchResult.completed;
      toggleCompletedRequestState.value = RequestState.LOADING;
      const todo = await MockApi.getTodo(id);
      if (todo == null) {
        console.warn('Could not find todo to toggle:', id);
        return;
      }
      const newTodo: Todo = {
        ...todo,
        completed: searchResult.completed,
      };
      await MockApi.updateTodo(newTodo);
      toggleCompletedRequestState.value = RequestState.SUCCESS;
    };

    return {
      allTodos,
      completedTodos,
      incompleteTodos,

      loadTodos,
      requestState,
      isLoading,

      toggleCompleted,
      isTogglingCompleted,
    };
  },
});
