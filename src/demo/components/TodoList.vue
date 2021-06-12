<template>
  <div class="space-y-4">
    <h3 class="heading">My Todos</h3>
    <ul class="list">
      <todo-list-item
        v-for="todo of incompleteTodos"
        :key="todo.id"
        :item="todo"
        :is-toggling-completed="isTogglingCompleted"
        @toggled="toggleCompleted"
      />
    </ul>

    <h3 v-if="incompleteTodos.length > 0" class="heading">Completed</h3>
    <ul class="list">
      <todo-list-item
        v-for="todo of completedTodos"
        :key="todo.id"
        :item="todo"
        :is-toggling-completed="isTogglingCompleted"
        @toggled="toggleCompleted"
      />
    </ul>

    <p v-if="isLoading">Loading...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useTodoListViewModel } from '../state/TodoListViewModel';
import TodoListItem from './TodoListItem.vue';

export default defineComponent({
  components: { TodoListItem },
  setup() {
    const {
      completedTodos,
      incompleteTodos,
      loadTodos,
      isLoading,
      isTogglingCompleted,
      toggleCompleted,
    } = useTodoListViewModel();

    onMounted(loadTodos);

    return {
      completedTodos,
      incompleteTodos,
      isLoading,
      loadTodos,
      toggleCompleted,
      isTogglingCompleted,
    };
  },
});
</script>

<style scoped>
.heading {
  @apply opacity-70 text-sm font-bold;
}

.list {
  @apply space-y-2;
}
</style>
